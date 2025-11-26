# Alternatív online fejlesztői eszközök (GitHub + Terminál)

Ha a Lovable.dev felülete a saját felhőjét erőlteti, az alábbi online dev környezetek jó alternatívák. Mindegyiknél elérhető GitHub integráció és böngészőből futtatható terminál (különböző korlátozásokkal).

## Gyors ajánlás
- Ha a legszorosabb GitHub-integrációt és teljes Linux konténert szeretnél: GitHub Codespaces
- Ha rugalmas, PR-centrikus, előépítéseket (prebuild) támogató megoldás kell: Gitpod
- Ha Node.js/web-first, nagyon gyors böngészős környezet kell: StackBlitz Codeflow vagy CodeSandbox Projects
- Ha egyszerű online IDE/terminál GitHub importtal kell: Replit vagy Codeanywhere
- Ha felhős (AWS/GCP/Azure) szolgáltatói környezetben dolgoznál: AWS Cloud9, Google Cloud Shell Editor, Azure Cloud Shell
- Ha sajátot akarsz (vendor lock-in minimalizálása): code-server (Coder) vagy Gitpod self-hosted

## Részletes alternatívák

1) GitHub Codespaces — https://github.com/features/codespaces
- Mit tud: Teljes VS Code a böngészőben, devcontainer/Docker alapú környezet, port forward, beépített terminál, GitHub PR/Issues integráció.
- Előnyök: GitHub-on natív, devcontainerrel hordozható beállítások, jó teljesítmény, egyszerű titokkezelés és portmegosztás.
- Korlátok/Ár: Ingyenes keret egyéni fiókoknál limitált, utána fogyasztásalapú. Vállalati fiókoknál kvóták/szabályok vonatkoznak.
- Mikor jó: Általános célú fejlesztésre bármilyen nyelven, ahol kell Docker és PR-áramlathoz szoros kötés.

2) Gitpod — https://gitpod.io
- Mit tud: Ephemerális (eldobható) dev környezetek, előépítések (prebuild) PR-okra, VS Code web/desktop kliens, több workspace-típus, terminál, port forward.
- Előnyök: CI-szerű dev élmény, gyors belépés új branch-ekre, remek PR-áramlathoz.
- Korlátok/Ár: Ingyenes órakeret korlátozott; nagyobb használat fizetős. Devcontainer támogatás erős, de néha finomhangolás kell.
- Mikor jó: Több kolléga/PR-intenzív projektek, gyors belépés új környezetekbe.

3) CodeSandbox Projects (Devboxes) — https://codesandbox.io
- Mit tud: Böngészős editor, konténeres „devbox” környezet, terminál, GitHub integráció, PR előnézetek, portmegnyitás.
- Előnyök: Gyors indulás, erős webes/Node-fejlesztésnél, megosztható preview-k.
- Korlátok/Ár: Free csomag limitált; haladó funkciók fizetősek. Nem minden nyelv/tooling támogatása olyan mély, mint Codespaces/Gitpod esetén.
- Mikor jó: Frontend/Node projektek, ahol gyors preview és kollaboráció fontos.

4) StackBlitz Codeflow — https://stackblitz.com/codeflow
- Mit tud: PR-alapú, böngészőben futó környezet WebContainers-szel, terminál-szerű élménnyel Node.js-hez, GitHub integráció.
- Előnyök: Azonnali indulás, kiváló web/Node prototípusokhoz, PR review-ra.
- Korlátok/Ár: Nem teljes értékű Linux VM/konténer; szerveroldali/binary-heavy toolchain esetén korlátos.
- Mikor jó: Node/Frontend fókusz, gyors kódreview és demók.

5) Replit — https://replit.com
- Mit tud: Online IDE terminállal, GitHub import/export, futtatás és megosztható linkek.
- Előnyök: Könnyű megosztás, sok nyelv támogatása, inkubáció/prototípus gyors.
- Korlátok/Ár: Free korlátok (CPU/mem/uptime), konténer feletti kontroll korlátozottabb, mint Codespaces/Gitpod esetén.
- Mikor jó: Gyors próbák, oktatás, hackathon jellegű munka.

6) Codeanywhere — https://codeanywhere.com
- Mit tud: Felhős IDE, konténer/VM alapú környezetek, SSH, terminál, GitHub integráció.
- Előnyök: „VS Code a felhőben” élmény, rugalmas kapcsolódás saját szerverekhez.
- Korlátok/Ár: Elsősorban fizetős, free/trial korlátozott.
- Mikor jó: Ha online IDE kell, de saját infrastruktúrákra is csatlakoznál.

7) AWS Cloud9 — https://aws.amazon.com/cloud9/
- Mit tud: AWS-alapú böngészős IDE teljes terminállal, EC2/Cloud9 integráció, Git támogatás, GitHub kapcsolódás beállítható.
- Előnyök: Natív AWS ökoszisztéma, projektjeidhez közeli infrastruktúra.
- Korlátok/Ár: Az alatta futó erőforrásokat (EC2/EBS) fizeted. Free keret korlátozott, gyorsan költségessé válhat.
- Mikor jó: Ha AWS-en élsz, és a fejlesztői környezetet is ott tartanád.

8) Google Cloud Shell Editor — https://cloud.google.com/shell
- Mit tud: Ingyenes böngészős shell állandó home tárhellyel (~5 GB), VS Code alapú editor, Git és GitHub integráció, terminál.
- Előnyök: Null telepítés, azonnali shell, kis feladatokra kiváló.
- Korlátok/Ár: Korlátozott erőforrás, hosszú futásokra/komoly buildre nem ideális.
- Mikor jó: Gyors admin/dev feladatok, kis projektek.

9) Azure Cloud Shell — https://learn.microsoft.com/azure/cloud-shell/overview
- Mit tud: Böngészős Bash/PowerShell, VS Code-ihletésű editor, Git és GitHub elérés.
- Előnyök: Null telepítés az Azure ökoszisztémában.
- Korlátok/Ár: Erőforrás és futásidő korlátok, komplex projektekhez kevés.
- Mikor jó: Azure-os admin feladatok, kisebb módosítások.

10) Saját hoszt: code-server (Coder) — https://github.com/coder/code-server
- Mit tud: Saját VM-en/felhőn futó VS Code a böngészőben, teljes terminál, SSH, tetszőleges Docker/Devcontainer.
- Előnyök: Teljes kontroll, adatszuverenitás, nincs vendor lock-in.
- Korlátok/Ár: Üzemeltetni kell (VM, biztonság, frissítések, HTTPS, backup).
- Mikor jó: Ha stabil, hosszú távú, kontrollált környezet kell.

11) Eclipse Che / Red Hat Dev Spaces — https://www.eclipse.org/che/
- Mit tud: Kubernetes-alapú, vállalati szintű felhős dev környezet, devfile/devcontainer, böngészős IDE, terminál.
- Előnyök: Nagyvállalati igényekre, erős szabályozhatóság.
- Korlátok/Ár: Üzemeltetés és komplexitás magasabb, mint a SaaS-oknál.
- Mikor jó: Ha K8s környezeted van és vállalati policy-ket kell betartani.

## Döntési szempontok
- Technológiai stack: Szükséges-e Docker/devcontainer, vagy elég a Node/web (StackBlitz/CodeSandbox)?
- Teljesítmény: Szükséges-e erősebb CPU/GPU, hosszú build? (Codespaces/Gitpod/Cloud9 jobb)
- PR/Review folyamat: Kell-e automatikus PR előnézet, ephemeral workspace, prebuild? (Gitpod/Codeflow)
- Költség: Free keret elég-e, vagy kell dedikált kapacitás? (Free → fizetős skála)
- Biztonság: Hol tárolódnak a titkok? (Codespaces/Gitpod titokkezelés, vagy saját hoszt)
- Hordozhatóság: Devcontainer használat minimalizálja a lock-int több szolgáltató között.

## Gyors migráció Lovable.dev-ről
1) GitHub repo legyen a forrás (push minden branch/tag)
2) Válassz szolgáltatót (pl. Codespaces vagy Gitpod)
3) Adj a repo-hoz `.devcontainer/` konfigurációt (Dockerfile/devcontainer.json) – hordozható több szolgáltató között
4) Engedélyezd a GitHub app/integrációt a választott eszköznél
5) Nyisd meg a workspace-t, futtasd: `npm install` → `npm run dev` (és szükséges háttérszolgáltatások)
6) Állítsd be a port forwardingot (pl. 5173), és a környezeti változókat/titkokat
7) Teszteld a PR alapon nyitott előnézeteket (ha támogatott)
8) Ha bevált, dokumentáld a csapatnak (README, onboarding)

## Tipp: devcontainer mint „közös nevező”
- A `.devcontainer` használatával ugyanaz a fejlesztői környezet futtatható Codespaces-ben, Gitpodban, CodeSandbox Devboxban és saját hoszton (code-server) is.
- Így könnyebben válthatsz szolgáltatót anélkül, hogy újra kellene építeni a környezetet.
