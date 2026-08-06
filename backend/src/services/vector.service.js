import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';


const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const hyperAI_index = pc.Index('hyperai');


export async function createMemory({ vectors, metadata, messageId }) {

    if (!vectors || !Array.isArray(vectors)|| vectors.length === 0) {
        console.error('Error: Vectors is not valid array.');
        return;
    }

    if (!messageId) {
      console.error('Vector Error: messageId is required.');
      return;
    }

    const sanitizedMetadata = { ...metadata };
    if (sanitizedMetadata.user) sanitizedMetadata.user = sanitizedMetadata.user.toString();
    if (sanitizedMetadata.chat) sanitizedMetadata.chat = sanitizedMetadata.chat.toString();

    await hyperAI_index.upsert({
        records: [
            {
                id: messageId.toString(),
                values: vectors,
                metadata : sanitizedMetadata
            }
        ]
    });
}

export async function queryMemory({ queryVector, limit = 5, metadata }) {

    const data = await hyperAI_index.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches

}

export async function deleteMemory(chatId) {

    try{
        await hyperAI_index.deleteMany({
            filter: {
                chat: {$eq:chatId}
            }
        })
        console.log(`Vector memories deleted for chatId: ${chatId}`);
    } catch (err) {
        console.error("Failed to delete memories from Pinecone:", err);
    }
}