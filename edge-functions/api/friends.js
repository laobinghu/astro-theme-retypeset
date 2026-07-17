/* eslint-disable no-undef, unused-imports/no-unused-vars */
// EdgeOne Edge Function for Friends API
// 使用 KV 存储友链数据
//
// ⚠️ KV 是全局变量，不是 context.env.my_kv
// 在控制台绑定命名空间时设置的变量名就是全局变量名

const KV_KEY = 'friends_list'

// 默认友链数据
const defaultFriends = [
  {
    name: '示例友链',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=example',
    description: '这是一个示例友链，你可以替换为你自己的友链数据',
  },
]

export default async function onRequest(context) {
  const { request } = context
  const method = request.method

  // CORS 预检
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // GET - 获取友链
  if (method === 'GET') {
    try {
      // ⚠️ friends_kv 是全局变量（在控制台绑定时设置的名称）
      const data = await friends_kv.get(KV_KEY, { type: 'json' })
      const friends = data?.friends || defaultFriends
      const lastUpdated = data?.lastUpdated || new Date().toISOString()

      return new Response(
        JSON.stringify({ friends, lastUpdated }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300',
          },
        },
      )
    }
    catch (e) {
      // KV 读取失败（可能是未绑定），返回默认数据
      return new Response(
        JSON.stringify({
          friends: defaultFriends,
          lastUpdated: new Date().toISOString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  }

  // POST - 添加/更新/删除友链
  if (method === 'POST') {
    try {
      const body = await request.json()
      const { action, friend } = body

      // 读取现有数据
      const data = await friends_kv.get(KV_KEY, { type: 'json' })
      let friends = data?.friends || [...defaultFriends]

      if (action === 'add' && friend) {
        const exists = friends.some(f => f.url === friend.url)
        if (!exists) {
          friends.push({
            name: friend.name || '未命名',
            url: friend.url,
            avatar: friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friend.name || 'default')}`,
            description: friend.description || '',
          })
        }
      }
      else if (action === 'update' && friend) {
        const index = friends.findIndex(f => f.url === friend.url)
        if (index !== -1) {
          friends[index] = { ...friends[index], ...friend }
        }
      }
      else if (action === 'remove' && friend?.url) {
        friends = friends.filter(f => f.url !== friend.url)
      }
      else {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }

      // 保存到 KV
      await friends_kv.put(KV_KEY, JSON.stringify({
        friends,
        lastUpdated: new Date().toISOString(),
      }))

      return new Response(
        JSON.stringify({ success: true, friends }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
    catch (e) {
      return new Response(
        JSON.stringify({ error: 'Failed to update friends' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  }

  // PUT - 初始化 KV 数据
  if (method === 'PUT') {
    try {
      const body = await request.json()
      const { friends } = body

      if (!Array.isArray(friends)) {
        return new Response(
          JSON.stringify({ error: 'friends must be an array' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }

      await friends_kv.put(KV_KEY, JSON.stringify({
        friends,
        lastUpdated: new Date().toISOString(),
      }))

      return new Response(
        JSON.stringify({ success: true, message: 'KV initialized' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
    catch (e) {
      return new Response(
        JSON.stringify({ error: 'Failed to initialize KV' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  }

  // 其他方法
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
