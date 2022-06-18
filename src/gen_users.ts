import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

interface UserComment {
  id: number
  body: string
}

interface User {
  userName: string
  userId: string
  lcus: boolean
}

const commentUserPath = '../dict/comment_user.json'
const userPath = '../dict/user.json'
const commnetUrl = 'https://api.github.com/repos/nice-people-frontend-community/nice-leetcode/issues/13/comments'
const resolve = (p: string) => path.resolve(__dirname, p)

; (async () => {
  try {
    const map = new Map<string, User>()
    const oldData = readFile(commentUserPath) || []
    oldData.forEach((item: User) => {
      if (item.userName && item.userId) {
        map.set(item.userId, item)
      }
    })

    // 用新数据增量更新老数据，同样的用户名，新的数据会覆盖老的数据
    const commentList = await axios.get<UserComment[]>(commnetUrl)
    commentList.data.forEach(item => {
      const user = parseComment(item.body)
      if (user.userName && user.userId) {
        map.set(user.userId, user)
      }
    })

    const commentUserList = Array.from(map.values())
    writeFile(commentUserPath, commentUserList)
    diffAndWriteToUser(userPath, commentUserList)
  } catch (error) {
    console.log(`登记comment用户失败： ${error}`)
  }
})()

function existFile(p: string) {
  try {
    fs.accessSync(resolve(p), fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}

function readFile(p: string) {
  try {
    if (!existFile(p)) {
      return null
    }

    const data = fs.readFileSync(resolve(p), 'utf8')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.log(`读取文件失败：${resolve(p)} ${error}`)
    return null
    // process.exit(1)
  }
}

function writeFile(p: string, d: any) {
  try {
    fs.writeFileSync(resolve(p), JSON.stringify(d), {
      encoding: 'utf8',
    })
  } catch (error) {
    console.log(`写入文件失败：${resolve(p)} ${error}`)
    // process.exit(1)
  }
}

function parseComment(comment: string): User {
  comment = comment.trim()

  const user = {
    userName: '',
    userId: '',
    lcus: false
  }

  if (comment.includes('leetcode') && comment.includes('微信昵称')) {
    // 换行的 kv 信息
    const kvList = comment.split('\n').map(s => s.trim())
    for (const kvstr of kvList) {
      const userId = getCommentField(kvstr, 'leetcode')
      if (userId) {
        user.userId = userId.startsWith('https://') ? userId.split('/')[4] : userId
        continue
      }

      const userName = getCommentField(kvstr, '微信昵称')
      if (userName) {
        user.userName = userName
        continue
      }

      const isCN = getCommentField(kvstr, '是否国区')
      if (isCN) {
        user.lcus = ['否', '不是', 'false'].includes(isCN) ? true : false
        continue
      }
    }
  }

  return user
}

function getCommentField(s: string, field: string) {
  let res = ''
  const fieldList = ['：', ':', ' ', '-'].map(suffix => `${field}${suffix}`)
  for (const field of fieldList) {
    if (s.startsWith(field)) {
      res = s.replace(field, '').trim()
      break
    }
  }
  return res
}

function diffAndWriteToUser(p: string, commentData: User[]) {
  const userData = readFile(p) || []

  // 读取遇到错误了，暂时不写入
  if (!userData.length || !commentData?.length) {
    return
  }

  const map = new Map<string, User>()
  userData.forEach((item: User) => {
    if (item.userId) {
      map.set(item.userId, item)
    }
  })

  commentData.forEach((user: User) => {
    if (user.userId && !map.has(user.userId)) {
      userData.push(user)
    }
  })

  writeFile(p, userData)
}
