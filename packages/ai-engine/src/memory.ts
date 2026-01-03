import type { MemoryEntry } from './types';

/**
 * Memory System - Conversation and Context Storage
 * 
 * TODO: Replace with persistent storage (Redis, PostgreSQL, Vector DB)
 * 
 * Integration points:
 * 1. Use vector database for semantic search (Pinecone, Weaviate)
 * 2. Store conversation history
 * 3. Implement RAG (Retrieval Augmented Generation)
 */

// In-memory storage (dummy)
const memoryStore: Map<string, MemoryEntry[]> = new Map();

/**
 * Store a memory entry
 * 
 * TODO: Replace with persistent database
 */
export function storeMemory(
  sessionId: string,
  content: string,
  metadata?: Record<string, any>
): void {
  const entry: MemoryEntry = {
    id: generateId(),
    timestamp: Date.now(),
    content,
    metadata,
  };

  if (!memoryStore.has(sessionId)) {
    memoryStore.set(sessionId, []);
  }

  memoryStore.get(sessionId)!.push(entry);
  
  console.log('[Memory] Stored:', entry);
}

/**
 * Retrieve memory entries for a session
 * 
 * TODO: Implement semantic search with vector database
 */
export function retrieveMemory(
  sessionId: string,
  query?: string,
  limit: number = 10
): MemoryEntry[] {
  const entries = memoryStore.get(sessionId) || [];
  
  if (!query) {
    // Return most recent entries
    return entries.slice(-limit);
  }
  
  // Dummy search: filter by content match
  const filtered = entries.filter(entry =>
    entry.content.toLowerCase().includes(query.toLowerCase())
  );
  
  return filtered.slice(-limit);
}

/**
 * Clear memory for a session
 */
export function clearMemory(sessionId: string): void {
  memoryStore.delete(sessionId);
  console.log('[Memory] Cleared session:', sessionId);
}

/**
 * Get conversation context
 * Returns recent conversation history for context
 */
export function getConversationContext(
  sessionId: string,
  maxTokens: number = 2000
): string {
  const entries = retrieveMemory(sessionId, undefined, 20);
  
  // Build context string (dummy - should calculate tokens)
  let context = '';
  let estimatedTokens = 0;
  
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const entryText = `[${new Date(entry.timestamp).toISOString()}] ${entry.content}\n`;
    const entryTokens = Math.ceil(entryText.length / 4); // Rough estimate
    
    if (estimatedTokens + entryTokens > maxTokens) {
      break;
    }
    
    context = entryText + context;
    estimatedTokens += entryTokens;
  }
  
  return context;
}

// Helper: Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
