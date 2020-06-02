#!/usr/bin/env python
### -#*- coding:gbk -*-

from calibre.web.feeds.recipes import BasicNewsRecipe # 引入 Recipe 基础类

class Epubee(BasicNewsRecipe): # 继承 BasicNewsRecipe 类的新类名

    #///////////////////
    # 设置电子书元数据
    #///////////////////
    title = '${title}' # 电子书名
    #description = 'Spring中文文档' # 电子书简介
    cover_url = '${coverUrl!""}' # 电子书封面
    #masthead_url = '' # 页头图片
    __author__ = '${author!""}' # 作者
    language = 'zh' # 语言
    #encoding = 'GBK' # 编码

    #///////////////////
    # 抓取页面内容设置
    #///////////////////
    #keep_only_tags = [{ 'class': 'example' }] # 仅保留指定选择器包含的内容
    #no_stylesheets = True # 去除 CSS 样式
    #remove_javascript = True # 去除 JavaScript 脚本
    auto_cleanup = True # 自动清理 HTML 代码
    delay = 5 # 抓取页面间隔秒数
    max_articles_per_feed = 999 # 抓取文章数量
    ignore_duplicate_articles = {'url'} # 去重
    remove_tags = [dict(name='div', class_='readertop'),
                   dict(name='div', class_='readermenu'),
                   dict(name='div', class_='readerbottom')]
    #///////////////////
    # 页面内容解析方法
    # [
    #     {
    #         'feed title',
    #         [
    #             {
    #                 'title'       : 'article title',
    #                 'url'         : 'URL of print version',
    #                 'date'        : 'The publication date of the article as a string',
    #                 'description': 'A summary of the article',
    #                 'content'     : '',
    #             }
    #         ]
    #     }
    # ]
    #///////////////////

    def parse_index(self):
        indexs = ["${downLoadUrl}"]
        ans = [] # 组成最终的数据结构
        for index in indexs :
            doc = self.parse_doc(index)
            ans = ans + doc
        return ans # 返回可供 Calibre 转换的数据结构

    def parse_doc(self,index):
        site = 'http://reader.epubee.com' # 页面列表页
        #index = '/docs/zh/spring-framework/5.1.3.RELEASE/reference'
        soup = self.index_to_soup(site + index) # 解析列表页返回 BeautifulSoup 对象
        # print soup.find('title').__dict__
        #print '==='
        #print soup.find(name="description")
        #print '==='
        #self.description = soup.find(name="description")['content']
        #links = soup.findAll("li",{"class":["level1","level2","level3","level4"]}) # 获取所有文章链接
        #print soup.text
        links = soup.findAll("div",{"class":["level_1"]})
        #print links[0].contents
        ans = [] # 组成最终的数据结构
        for link in links: # 循环处理所有文章链接
            node = self.parseLeve("level_1",link)
            print node
            articles = [] # 定义空文章资源数组
            if node['childs'].length > 0:
                for child in node['childs']:
                    cNode = self.parseLeve("level_2",child)
                    articles.append({'title': cNode['title'] , 'url': cNode['url'], 'content' : ''})  # 组合标题和链接 # 累加到数组中
                    for child2 in cNode['childs']:
                        cNode2 = self.parseLeve("level_3",child2)
                        articles.append({'title': cNode2['title'] , 'url': cNode2['url'], 'content' : ''})  # 组合标题和链接 # 累加到数组中
                ans.append((node['title'], articles))
            else:
                articles.append({'title': node['title'] , 'url':node['url'], 'content' : ''})
                ans.append((node['title'], articles))
        print ans
        return ans # 返回可供 Calibre 转换的数据结构

    def parseLeve(self,childLevel,soup):
        site = 'http://reader.epubee.com'
        root = soup.p.a
        #print root
        doctitle = root.contents[0].strip()
        docurl = root.get("href")
        list = soup.findAll("div",{"class":[childLevel]})
        rr = {'title': doctitle, 'url': site + docurl, 'childs': list}
        print rr
        return rr
