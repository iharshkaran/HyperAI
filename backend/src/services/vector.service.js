import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';


const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatGptCloneIndex = pc.Index('chatgptclone');

export async function createMemory({ vectors, metadata, messageId }) {

    if (!vectors || !Array.isArray(vectors)) {
        console.error('Error: Vectors is not valid array.');
        return;
    }

    const sanitizedMetadata = { ...metadata };
    if (sanitizedMetadata.user) sanitizedMetadata.user = sanitizedMetadata.user.toString();
    if (sanitizedMetadata.chat) sanitizedMetadata.chat = sanitizedMetadata.chat.toString();

    await chatGptCloneIndex.upsert({
        records: [
            {
                id: messageId.toString(),
                values: vectors,
                metadata
            }
        ]
    });
}

export async function queryMemory({ queryVector, limit = 5, metadata }) {

    const data = await chatGptCloneIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches

}

export async function deleteMemory(chatId) {

    try{
        await chatGptCloneIndex.deleteMany({
            filter: {
                chat: {$eq:chatId}
            }
        })
        console.log(`Vector memories deleted for chatId: ${chatId}`);
    } catch (err) {
        console.error("Failed to delete memories from Pinecone:", err);
    }
}