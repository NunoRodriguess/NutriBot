# Run

Either do:
`python src/app.py`

Or:
`docker-compose up --build`

# Hierarchical RAG with Pinecone & LLaMA Embeddings

This project implements a **Hierarchical Retrieval-Augmented Generation (RAG)** system using Pinecone for vector search and LLaMA-2 embeddings via the `llama-text-embed-v2` model. It prioritizes higher-level content over deeper levels, while still allowing fallback to lower hierarchies only when necessary.

---

## What is Hierarchical RAG?

**Hierarchical RAG** is a retrieval strategy that prefers results from higher (more general or important) content levels, but can fall back to lower (more detailed or niche) levels if not enough relevant content is found.

The core idea is:
- Favor results from **higher hierarchical levels** (p.e. prefer level 1 content over levels 2 or 3).
- Only goes to deeper levels **if** we don't get enough high-quality matches above a certain **threshold**.
- Lower hierarchy matches can only replace higher ones **if they outperform a low-scoring one below the threshold**.

---

## How It Works

1. **Embed the query** once using the `llama-text-embed-v2` model.
2. Loop through hierarchy levels from **1 to N** (default: 3).
3. At each level:
   - Query Pinecone for topK results (default: 3).
   - Sort results by similarity score.
   - Add matches **only if**:
     - They're above the threshold, or
     - We still have empty result slots.
     - Or, they can replace an existing **low-scoring** match (below threshold).
4. **Stop early** if:
   - We’ve filled all topK slots.
   - All are above threshold.
   - All are from current or higher levels.


```mermaid
flowchart TD
    A[Start Query] --> B[Embed with LLaMA-2]
    B --> C[Set Hierarchy Level = 1]
    C --> D[Query Pinecone with hierarchy filter]
    D --> E[Sort results by score]
    E --> F{Enough results above threshold?}
    
    F -- Yes --> G[Stop search]
    F -- No --> H[Add or Replace low-score results]

    H --> I{Reached max hierarchy level?}
    I -- No --> J[Increase Hierarchy Level]
    J --> D

    I -- Yes --> G
    G --> K[Return Final Results]

