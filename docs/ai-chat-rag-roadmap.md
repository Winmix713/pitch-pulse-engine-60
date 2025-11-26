# AI Chat RAG & OpenAI Integration Roadmap

## Current Status: MVP (Version 1.0)

The current implementation provides:
- ✅ Natural language chat interface
- ✅ Team name extraction and matching
- ✅ Structured data aggregation (matches, H2H, form)
- ✅ Formatted analysis response generation
- ✅ User-friendly error handling
- ✅ Analytics logging

**Limitation**: Uses rule-based analysis instead of OpenAI GPT-4

---

## Phase 2: OpenAI GPT-4 Integration (Planned)

### Objectives
Replace the rule-based analysis with OpenAI GPT-4 for:
- More natural, narrative-style responses
- Better understanding of complex user queries
- Multi-turn conversation context
- Personalized recommendations

### Implementation Steps

#### 2.1 Setup OpenAI Integration
```bash
# Install dependencies
npm install openai @types/openai

# For Edge Functions (Deno)
# OpenAI already available via esm.sh
```

#### 2.2 Environment Configuration
Update Edge Function environment variables:
```toml
# supabase/functions/ai-chat/.env
OPENAI_API_KEY=sk_...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

#### 2.3 OpenAI Client Setup
Replace Edge Function section with:
```typescript
// supabase/functions/ai-chat/openai-client.ts
import { OpenAI } from "https://esm.sh/openai@4.24.0";

export function createOpenAIClient() {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

export async function generateAnalysis(
  client: OpenAI,
  context: AnalysisContext
): Promise<string> {
  const prompt = buildAnalysisPrompt(context);
  
  const message = await client.messages.create({
    model: "gpt-4-turbo-preview",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

function buildAnalysisPrompt(context: AnalysisContext): string {
  return `
Analyze the following football match data and provide a comprehensive prediction analysis:

Home Team: ${context.homeTeam.name}
Away Team: ${context.awayTeam.name}

Recent Form:
- ${context.homeTeam.name}: ${context.homeForm}/100
- ${context.awayTeam.name}: ${context.awayForm}/100

Head-to-Head Record:
${context.h2hMatches.map(m => `- ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`).join('\n')}

Detected Patterns:
${context.patterns.map(p => `- ${p.type}: ${p.confidence}% confidence`).join('\n')}

Please provide:
1. Form analysis (which team is in better form)
2. H2H advantage analysis
3. Key patterns and their significance
4. Betting recommendation with risk assessment
5. Confidence level (0-100%)

Format the response in Hungarian and make it engaging for betting analysis.
`;
}
```

#### 2.4 Update Edge Function
```typescript
// supabase/functions/ai-chat/index.ts
import { createOpenAIClient, generateAnalysis } from './openai-client.ts';

serve(async (req) => {
  // ... existing code ...
  
  // Generate analysis using OpenAI (replaces rule-based analysis)
  let analysisMessage: string;
  
  if (Deno.env.get('OPENAI_API_KEY')) {
    // Use OpenAI if configured
    try {
      const openaiClient = createOpenAIClient();
      const context = {
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeForm: calculateFormScore(homeMatches, homeTeam.id),
        awayForm: calculateFormScore(awayMatches, awayTeam.id),
        h2hMatches,
        patterns: [] // Add pattern detection results
      };
      
      analysisMessage = await generateAnalysis(openaiClient, context);
      model = 'gpt-4-turbo-preview';
    } catch (error) {
      console.error('OpenAI error, falling back to rule-based:', error);
      analysisMessage = generateAnalysisResponse(...); // Fallback
    }
  } else {
    // Fallback to rule-based (current implementation)
    analysisMessage = generateAnalysisResponse(
      homeTeam,
      awayTeam,
      homeMatches,
      awayMatches,
      h2hMatches
    );
    model = 'rule-based-fallback';
  }
  
  // ... rest of code ...
});
```

---

## Phase 3: RAG (Retrieval-Augmented Generation) Enhancement

### Objectives
Implement vector embeddings for:
- Better team/league matching (semantic search)
- Historical pattern context retrieval
- Multi-match similarity analysis
- Temporal context understanding

### Implementation Steps

#### 3.1 Create Embeddings Table
```sql
-- supabase/migrations/XXX_add_embeddings.sql
CREATE TABLE IF NOT EXISTS team_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id),
  description text NOT NULL,
  embedding vector(1536),
  created_at timestamp DEFAULT now(),
  UNIQUE(team_id)
);

CREATE TABLE IF NOT EXISTS match_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id),
  context text NOT NULL,
  embedding vector(1536),
  created_at timestamp DEFAULT now(),
  UNIQUE(match_id)
);

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for similarity search
CREATE INDEX ON team_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX ON match_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

#### 3.2 Generate Embeddings
```typescript
// supabase/functions/ai-chat/embeddings.ts
import { OpenAI } from "https://esm.sh/openai@4.24.0";

export async function generateTeamEmbeddings(
  openaiClient: OpenAI,
  supabase: SupabaseClient,
  teamId: string
) {
  // Get team data
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, league_id')
    .eq('id', teamId)
    .single();

  if (!team) return;

  // Create description for embedding
  const description = `Team: ${team.name}, League: ${team.league_id}`;

  // Generate embedding
  const embeddingResponse = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: description,
  });

  // Store embedding
  await supabase.from('team_embeddings').upsert({
    team_id: teamId,
    description,
    embedding: embeddingResponse.data[0].embedding,
  });
}

export async function searchSimilarTeams(
  openaiClient: OpenAI,
  supabase: SupabaseClient,
  query: string,
  limit: number = 5
) {
  // Generate embedding for query
  const embeddingResponse = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  // Search for similar teams
  const { data: similarTeams } = await supabase.rpc(
    'match_teams',
    {
      query_embedding: embeddingResponse.data[0].embedding,
      match_threshold: 0.5,
      match_count: limit,
    }
  );

  return similarTeams;
}
```

#### 3.3 Update Team Matching
```typescript
// supabase/functions/ai-chat/index.ts
// Replace simple name matching with embedding search

async function getTeamByNameSemantic(
  openaiClient: OpenAI,
  supabase: SupabaseClient,
  teamName: string
): Promise<Team | null> {
  // Try exact match first
  let { data: exactMatch } = await supabase
    .from('teams')
    .select('id, name, league_id')
    .ilike('name', teamName)
    .limit(1)
    .single();

  if (exactMatch) return exactMatch as Team;

  // Fall back to semantic search using embeddings
  try {
    const embedding = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: teamName,
    });

    const { data: semanticResults } = await supabase
      .rpc('match_teams', {
        query_embedding: embedding.data[0].embedding,
        match_threshold: 0.5,
        match_count: 3,
      });

    if (semanticResults && semanticResults.length > 0) {
      return semanticResults[0] as Team;
    }
  } catch (error) {
    console.error('Semantic search failed, falling back to fuzzy:', error);
  }

  // Fuzzy fallback
  const { data: fuzzyResults } = await supabase
    .from('teams')
    .select('id, name, league_id')
    .ilike('name', `%${teamName}%`)
    .limit(1);

  return fuzzyResults?.[0] as Team | null;
}
```

---

## Phase 4: Multi-Turn Conversations (Planned)

### Objectives
Enable conversational context for:
- Follow-up questions
- Progressive refinement
- User preference learning
- Session-based recommendations

### Implementation Steps

#### 4.1 Store Conversation History
```sql
-- supabase/migrations/XXX_add_conversations.sql
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  started_at timestamp DEFAULT now(),
  last_message_at timestamp DEFAULT now(),
  context jsonb DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

CREATE INDEX ON conversation_messages(conversation_id);
CREATE INDEX ON conversations(user_id);
```

#### 4.2 Conversation Context Injection
```typescript
// supabase/functions/ai-chat/conversations.ts
export async function getConversationContext(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatMessage[]> {
  const { data: messages } = await supabase
    .from('conversation_messages')
    .select('role, content')
    .eq('conversation_id', userId)
    .order('created_at', { ascending: true })
    .limit(10); // Last 10 messages for context

  return messages || [];
}

export function buildContextualPrompt(
  basePrompt: string,
  conversationHistory: ChatMessage[]
): OpenAI.MessageParam[] {
  const messages: OpenAI.MessageParam[] = [];

  // Add system prompt
  messages.push({
    role: 'system',
    content: `You are a football betting analysis assistant. Provide detailed, 
      actionable insights in Hungarian. Consider previous conversation context.`
  });

  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    });
  });

  // Add current query
  messages.push({
    role: 'user',
    content: basePrompt
  });

  return messages;
}
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache embeddings and analysis for frequently queried teams
const CACHE_TTL_SECONDS = 3600; // 1 hour

async function getCachedAnalysis(
  supabase: SupabaseClient,
  teamPair: TeamPair
): Promise<string | null> {
  const cacheKey = `analysis_${teamPair.home}_${teamPair.away}`;
  
  const { data: cached } = await supabase
    .from('cache')
    .select('value, created_at')
    .eq('key', cacheKey)
    .single();

  if (cached) {
    const age = (Date.now() - new Date(cached.created_at).getTime()) / 1000;
    if (age < CACHE_TTL_SECONDS) {
      return cached.value;
    }
  }

  return null;
}
```

### Batch Processing
```typescript
// Process embeddings in batches for efficiency
async function batchGenerateEmbeddings(
  openaiClient: OpenAI,
  teamIds: string[]
) {
  const batchSize = 10;
  for (let i = 0; i < teamIds.length; i += batchSize) {
    const batch = teamIds.slice(i, i + batchSize);
    await Promise.all(
      batch.map(id => generateTeamEmbeddings(openaiClient, supabase, id))
    );
  }
}
```

---

## Cost Estimation

### OpenAI API Costs (Monthly)
- **GPT-4 Turbo Completion**: ~0.01 - 0.03 USD per 1K tokens
- **Embeddings (text-embedding-3-small)**: ~0.02 USD per 1M tokens
- **Estimated usage**: 100K requests/month = $500 - $1000/month

### Optimization for Cost
1. Use GPT-3.5-turbo for simpler queries
2. Implement caching to reduce redundant API calls
3. Batch embeddings generation during off-peak hours
4. Use prompt caching (new OpenAI feature)

---

## Migration Path

### From MVP → Full RAG Integration

**Step 1**: Add OpenAI API support (keep fallback)
```bash
# Deploy with OPENAI_API_KEY empty
# Verify rule-based fallback works
# Gradually enable with small subset of users
```

**Step 2**: Add embeddings infrastructure
```bash
# Deploy Supabase migrations
# Backfill existing team embeddings
# Monitor performance impact
```

**Step 3**: Implement semantic search
```bash
# Replace exact matching with embedding search
# A/B test accuracy improvements
# Monitor cost impact
```

**Step 4**: Add conversation context
```bash
# Deploy conversation storage
# Implement context injection
# Train users on multi-turn queries
```

---

## Testing & Validation

### Quality Metrics
- **Accuracy**: % of correct team identification (target: >98%)
- **Latency**: Response time <2s (target: <1.5s)
- **Cost**: Cost per request (target: <$0.01)
- **User Satisfaction**: Rating >4.5/5

### A/B Testing
```
Group A: Rule-based analysis (current)
Group B: OpenAI + semantic search (new)
Metrics: Accuracy, click-through, conversion
Duration: 2-4 weeks
```

---

## References

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [RAG Pattern](https://docs.llamaindex.ai/)
- [Vector Database Best Practices](https://supabase.com/docs/guides/database/extensions/vector)
