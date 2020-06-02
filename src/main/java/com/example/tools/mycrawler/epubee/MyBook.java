package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.BookFormat;
import com.example.tools.mycrawler.HttpUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class MyBook {
    private static Logger logger = LoggerFactory.getLogger(MyBook.class);

    public static List<Book> myBook(UserContext user) throws TimeoutException {
        Map<String, String> heads = new HashMap<>();
        heads.put("X-Forwarded-For", user.getIp());
        Map<String, String> response = HttpUtils.get("http://cn.epubee.com/files.aspx", "identify=" + user.getId(), heads);
        if (response == null || !response.get("responseCode").equals("200")) {
            response = HttpUtils.get("http://cn.epubee.com/files.aspx", "identify=" + user.getId(), heads, 3, 20000);
        }
        if (response == null || !response.get("responseCode").equals("200")) {
            logger.error("我的书籍读取失败！\n" + user.toString() + "\n");
            throw new TimeoutException("我的书籍读取失败");
        }

        List<Book> list = new ArrayList<>();

        Document listPage = Jsoup.parse(response.get("body"));
        String select = "form table tr td div#centerContent div#centerRight div table.gv tr.parent";
        Elements links = listPage.select(select);
        for (int i = 0; i < links.size(); i++) {
            Element element = links.get(i);
            try {
                String title = element.select("td div.listEbook div.contentshow span#gvBooks_lblTitle_" + i).text();
                String format = element.select("td div.listEbook div.contentshow span#gvBooks_lblExtensions_" + i).text().trim().split(" ")[0].substring(1).toUpperCase();
                String size = element.select("td div.listEbook div.contentshow div table#gvBooks_gvBooks_child_" + i + " tr td.gvchild_first div.book_child span.list-filesize_k").text();
                String reader = "http://cn.epubee.com/" + element.select("td div.listEbook div.contentshow div table#gvBooks_gvBooks_child_" + i + " tr td.list_reader a.child_send").attr("href");
                String coverUrl = element.select("td div.listEbook div.covershow img").attr("src");
                String author = element.select("td div.listEbook div.contentshow span#gvBooks_lblAuthor_" + i).text();
                BookFormat bookFormat = null;
                try {
                    BookFormat.valueOf(format);
                } catch (Exception e) {
                }
                list.add(new Book(null, title, size, bookFormat, reader,coverUrl,author, null));
            } catch (Exception e) {
                logger.error("我的书籍读取失败！\n" + element.toString() + "\n", e);
            }
        }

        return list;
    }

}
