import { connectToDatabase } from '../lib/db';

const COLLECTION = 'projectConfigs';

export async function getProjectConfig() {
  const { db } = await connectToDatabase();
  const config = await db.collection(COLLECTION).findOne({});
  return config || { selectedProjects: [], order: [] };
}

export async function updateProjectConfig(selectedProjects, order) {
  const { db } = await connectToDatabase();
  
  // 使用 upsert 确保总是只有一个配置文档
  await db.collection(COLLECTION).updateOne(
    {}, // 空查询条件，匹配第一个文档
    {
      $set: {
        selectedProjects,
        order,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
  
  return { selectedProjects, order };
} 