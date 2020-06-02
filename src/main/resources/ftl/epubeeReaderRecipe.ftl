#!/usr/bin/env python
### -#*- coding:gbk -*-

from calibre.web.feeds.recipes import BasicNewsRecipe # ���� Recipe ������

class Epubee(BasicNewsRecipe): # �̳� BasicNewsRecipe ���������

    #///////////////////
    # ���õ�����Ԫ����
    #///////////////////
    title = '${title}' # ��������
    #description = 'Spring�����ĵ�' # ��������
    cover_url = '${coverUrl!""}' # ���������
    #masthead_url = '' # ҳͷͼƬ
    __author__ = '${author!""}' # ����
    language = 'zh' # ����
    #encoding = 'GBK' # ����

    #///////////////////
    # ץȡҳ����������
    #///////////////////
    #keep_only_tags = [{ 'class': 'example' }] # ������ָ��ѡ��������������
    #no_stylesheets = True # ȥ�� CSS ��ʽ
    #remove_javascript = True # ȥ�� JavaScript �ű�
    auto_cleanup = True # �Զ����� HTML ����
    delay = 5 # ץȡҳ��������
    max_articles_per_feed = 999 # ץȡ��������
    ignore_duplicate_articles = {'url'} # ȥ��
    remove_tags = [dict(name='div', class_='readertop'),
                   dict(name='div', class_='readermenu'),
                   dict(name='div', class_='readerbottom')]
    #///////////////////
    # ҳ�����ݽ�������
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
        ans = [] # ������յ����ݽṹ
        for index in indexs :
            doc = self.parse_doc(index)
            ans = ans + doc
        return ans # ���ؿɹ� Calibre ת�������ݽṹ

    def parse_doc(self,index):
        site = 'http://reader.epubee.com' # ҳ���б�ҳ
        #index = '/docs/zh/spring-framework/5.1.3.RELEASE/reference'
        soup = self.index_to_soup(site + index) # �����б�ҳ���� BeautifulSoup ����
        # print soup.find('title').__dict__
        #print '==='
        #print soup.find(name="description")
        #print '==='
        #self.description = soup.find(name="description")['content']
        #links = soup.findAll("li",{"class":["level1","level2","level3","level4"]}) # ��ȡ������������
        #print soup.text
        links = soup.findAll("div",{"class":["level_1"]})
        #print links[0].contents
        ans = [] # ������յ����ݽṹ
        for link in links: # ѭ������������������
            node = self.parseLeve("level_1",link)
            print node
            articles = [] # �����������Դ����
            if node['childs'].length > 0:
                for child in node['childs']:
                    cNode = self.parseLeve("level_2",child)
                    articles.append({'title': cNode['title'] , 'url': cNode['url'], 'content' : ''})  # ��ϱ�������� # �ۼӵ�������
                    for child2 in cNode['childs']:
                        cNode2 = self.parseLeve("level_3",child2)
                        articles.append({'title': cNode2['title'] , 'url': cNode2['url'], 'content' : ''})  # ��ϱ�������� # �ۼӵ�������
                ans.append((node['title'], articles))
            else:
                articles.append({'title': node['title'] , 'url':node['url'], 'content' : ''})
                ans.append((node['title'], articles))
        print ans
        return ans # ���ؿɹ� Calibre ת�������ݽṹ

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
