// 笔记页内切换脚本
// 点击侧边栏笔记时，动态加载内容而不刷新页面

document.addEventListener('DOMContentLoaded', () => {
  const noteLinks = document.querySelectorAll('.note-item a')
  const noteContent = document.querySelector('.notes-main')

  if (!noteContent || noteLinks.length === 0)
    return

  // 为每个笔记链接添加点击事件
  noteLinks.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault()

      const url = link.getAttribute('href')
      if (!url)
        return

      // 更新选中状态
      document.querySelectorAll('.note-item').forEach((item) => {
        item.classList.remove('active')
      })
      link.closest('.note-item')?.classList.add('active')

      try {
        // 获取笔记页面内容
        const response = await fetch(url)
        const html = await response.text()

        // 解析 HTML 提取笔记内容
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const newContent = doc.querySelector('.notes-main')

        if (newContent) {
          // 更新内容区域
          noteContent.innerHTML = newContent.innerHTML

          // 更新浏览器地址栏
          history.pushState({}, '', url)

          // 更新页面标题
          const title = doc.querySelector('.note-title')
          if (title) {
            document.title = `${title.textContent} - 笔记`
          }
        }
      }
      catch (error) {
        console.error('加载笔记失败:', error)
        // 失败时回退到正常导航
        window.location.href = url
      }
    })
  })

  // 处理浏览器后退/前进按钮
  window.addEventListener('popstate', () => {
    window.location.reload()
  })
})
