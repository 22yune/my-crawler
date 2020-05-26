package com.example.tools.mycrawler;

import com.example.tools.mycrawler.amazon.AmazonVisit;
import org.apache.commons.io.FileUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by baogen.zhang on 2019/6/26
 *
 * @author baogen.zhang
 * @date 2019/6/26
 */
public class queryTest {

    @Test
    public void test(){

        String url1 = "https://www.cnblogs.com/peida/tag/%E8%BD%AF%E4%BB%B6%E8%AE%BE%E8%AE%A1/default.html?page=1";
        String url2 = "https://www.cnblogs.com/peida/tag/%E8%BD%AF%E4%BB%B6%E8%AE%BE%E8%AE%A1/default.html?page=2";
        String select = "html body div#home div#main div#mainContent div.forFlow div#myposts div.PostList div.postTitl2 a";
        List<Article> list = query(url1,select);
        list.addAll(query(url2,select));
        list.sort((a,b) -> list.indexOf(b) - list.indexOf(a) );

        System.out.println(String.join(",\n",list.stream().map(article -> article.toString()).collect(Collectors.toList())));
    }
    private List<Article> query(String url, String sel){
        Elements elements = AmazonVisit.getDocument(url,1).select(sel);
        System.out.println(elements);
        return elements.stream().map(element -> new Article(element.ownText(),element.attr("href"))).collect(Collectors.toList());
    }

    private static class Article{
         private String title;
         private String url;

        public Article(String title, String url) {
            this.title = title;
            this.url = url;
        }

        @Override
        public String toString() {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.append("{");
            stringBuilder.append("'title': ");
            stringBuilder.append("'" + title + "'");
            stringBuilder.append(" , 'url':");
            stringBuilder.append("'" + url + "'}");
            return stringBuilder.toString();
        }
    }
}
