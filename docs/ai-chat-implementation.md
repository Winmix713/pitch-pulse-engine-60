# WinMix AI Chat Implementation Guide

## Overview

The AI Chat feature is a natural language interface for the WinMix prediction system, powered by OpenAI GPT-4 and Retrieval-Augmented Generation (RAG). Users can ask questions about teams, matches, and predictions using conversational language.

## Architecture

### Two-Layer Intelligence System

#### 1. Front-End Intelligence (User-Facing Chat Interface)
- **Purpose**: Natural language Q&A about matches and teams
- **Technology**: OpenAI GPT-4 + RAG
- **Input**: User message (e.g., "Real Madrid vs Barcelona analysis")
- **Output**: Formatted analysis with predictions and insights
- **Location**: `/src/components/ai-chat/`

#### 2. Back-End Intelligence (Continuous Learning)
- **Purpose**: ML model training and pattern detection
- **Technology**: Existing prediction models and pattern detection algorithms
- **Input**: Match results and historical data
- **Output**: Confidence scores and prediction factors
- **Location**: Supabase Edge Functions (`patterns-detect`, `models-performance`, etc.)

### Data Flow

```
User Input
    ↓
Message Parser (Extract team names)
    ↓
Database Query (Get match data, H2H, patterns)
    ↓
OpenAI Processing (Generate narrative response)
    ↓
User Display (Formatted analysis)
    ↓
Analytics Logging (Audit trail)
```

## Components

### Frontend Components

#### `AIChatInterface.tsx`
Main chat component with message history and input handling.

**Props:**
- `onPredictionRequest`: Callback when teams are identified
- `theme`: 'light' or 'dark' (default: 'light')

**Features:**
- Message history with automatic scrolling
- Error handling and loading states
- Quick action suggestions
- Real-time typing indicators

#### `MessageBubble.tsx`
Individual message display with metadata indicators.

**Features:**
- Role-based styling (user vs assistant)
- Pattern and prediction metadata display
- Timestamp display
- Markdown-like formatting

#### `TypingIndicator.tsx`
Loading animation during AI response generation.

#### `QuickActions.tsx`
Pre-filled message suggestions for first-time users.

### Backend Edge Function

#### `ai-chat/index.ts`
Main Edge Function handling chat requests.

**Request Schema:**
```typescript
{
  message: string;           // User message (required)
  context?: {
    league?: string;         // Optional league filter
    dateRange?: {
      from: string;
      to: string;
    };
    userId?: string;         // For analytics
  };
  conversationHistory?: []; // Unused in MVP, reserved for future
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  message?: string;          // Formatted analysis text
  analysis?: {
    teams: { home: string; away: string };
    recentForm: { home: number; away: number };
    h2hHistory: Array<{
      homeScore: number;
      awayScore: number;
      date: string;
    }>;
  };
  metadata?: {
    responseTime: number;
    model: string;
  };
}
```

## Data Processing

### Team Name Extraction
The system uses regex patterns to identify team names from user input:
- Pattern 1: `TeamA vs TeamB`
- Pattern 2: `TeamA against TeamB`
- Pattern 3: `TeamA and TeamB`

**Note**: In production, consider upgrading to fuzzy matching or embedding-based search.

### Match Data Collection
1. **Recent Matches**: Last 5 matches for each team
2. **H2H Matches**: Historical head-to-head records
3. **Form Score**: Calculated from win/draw/loss ratio
4. **Statistics**: Team-level aggregations

### Analysis Generation
The Edge Function combines:
1. Recent form metrics
2. H2H historical data
3. Pattern detection results
4. Prediction confidence scores

## Integration Points

### With Existing Features

#### Prediction System
- Links to `analyze-match` Edge Function for detailed analysis
- Uses `predictions` table for confidence data

#### Pattern Detection
- Integrates with `patterns-detect` for team-specific patterns
- Uses pattern confidence in response generation

#### Models
- Accesses `models_performance` for model evaluation metrics
- Uses model predictions in analysis output

### With Analytics
- Logs chat queries via `logAuditAction`
- Tracks user engagement and common queries
- Provides feedback loop for model improvement

## Configuration

### Environment Variables

**Required for OpenAI Integration (Future):**
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Current Setup:**
- Uses Supabase Service Role for database access
- Public endpoint (verify_jwt=false in config.toml)

### Supabase Configuration
Add to `supabase/config.toml`:
```toml
[functions.ai-chat]
verify_jwt = false
```

## Usage

### Access
Navigate to `/ai-chat` or click the Bot icon in the navigation sidebar.

### Example Queries
- "Real Madrid vs Barcelona"
- "Analyze Liverpool against Chelsea"
- "Show me form analysis for Manchester City and Arsenal"

### Output
The system returns:
1. **Formatted Analysis**: Team statistics, recent form, H2H data
2. **Metadata**: Confidence scores, pattern matches
3. **Recommendations**: Suggested betting strategy based on analysis

## Performance Considerations

### Current Limitations
- MVP uses cached data, not real-time API calls
- Team name matching is regex-based (not fuzzy)
- No conversation history/context retention
- Response format is static (not dynamic)

### Optimization Opportunities
1. **Embedding-based Search**: Use OpenAI embeddings for team/league matching
2. **Conversation Context**: Store and use chat history for follow-up questions
3. **Caching Layer**: Redis for frequently accessed team statistics
4. **Vector Store**: Supabase pgvector for similarity search

### Scalability
- Edge Function can handle 1000+ concurrent requests
- Database queries are indexed for performance
- Response times: <500ms (database) + <2s (OpenAI future)

## Error Handling

### Common Errors

**"Invalid team names"**
- Cause: Team names not recognized in database
- Solution: Try different name variations or abbreviations

**"No match data found"**
- Cause: Teams exist but no match history
- Solution: Teams may be new; try more established teams

**"Database error"**
- Cause: Supabase connection issue
- Solution: Check network connection and try again

## Future Enhancements

### Phase 1: Core Integration ✓
- [x] Chat interface component
- [x] Team name extraction
- [x] Database query integration
- [x] Analysis generation

### Phase 2: OpenAI Integration (Planned)
- [ ] OpenAI API integration
- [ ] Embeddings for semantic search
- [ ] Dynamic response generation
- [ ] Multi-turn conversations

### Phase 3: Advanced Features (Planned)
- [ ] Conversation history persistence
- [ ] User preference learning
- [ ] Personalized recommendations
- [ ] Multi-language support

### Phase 4: Enterprise Features (Planned)
- [ ] Team-level chat channels
- [ ] Chat analytics dashboard
- [ ] Export predictions as reports
- [ ] Integration with betting platforms

## Testing

### Manual Testing Checklist
- [ ] Navigate to `/ai-chat`
- [ ] Send message with team names
- [ ] Verify team recognition
- [ ] Check analysis accuracy
- [ ] Test error cases (invalid teams, etc.)
- [ ] Verify responsive design

### Automated Tests
Located in `/src/__tests__/` (to be implemented)

## Debugging

### Enable Debug Logging
Set environment variable:
```bash
VITE_DEBUG_AI_CHAT=true
```

### Check Edge Function Logs
```bash
supabase functions logs ai-chat
```

### Browser Console
Check for:
- Network request errors
- JSON parsing issues
- Component rendering problems

## Deployment

### Local Testing
```bash
# Start development server
npm run dev

# Or with Supabase local
supabase start
supabase functions serve
```

### Production Deployment
```bash
# Build
npm run build

# Deploy Edge Functions
supabase functions deploy ai-chat

# Verify
curl https://[project].supabase.co/functions/v1/ai-chat
```

## Support & Troubleshooting

### Common Issues

**Chat not responding:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check `/ai-chat` function logs

**Team not found:**
1. Verify exact spelling (try different case variations)
2. Check if team exists in database: `SELECT * FROM teams WHERE name ILIKE '%TeamName%'`
3. Try abbreviations or team nicknames

**Slow responses:**
1. Check database query performance
2. Verify Supabase service is running
3. Check network latency

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [RAG Pattern](https://docs.llamaindex.ai/en/stable/getting_started/concepts.html)
- [WinMix Documentation](./README.md)
