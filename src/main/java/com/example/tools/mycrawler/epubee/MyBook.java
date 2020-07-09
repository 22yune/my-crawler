package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.BookFormat;
import com.example.tools.mycrawler.HttpUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class MyBook {
    private static Logger logger = LoggerFactory.getLogger(MyBook.class);
    private static Pattern pattern = Pattern.compile("supFlash\\(\\\"(.*?)\\\"");

    public static List<Book> myBook(UserContext user) throws TimeoutException {
        Map<String, String> response = req(user.getIp(),user.getCookie());
        Matcher m = pattern.matcher(response.get("body"));
        String td = "";
        if(m.find()){
            td = m.group(1);
        }
        response = req(user.getIp(),user.getCookie() + "; td_cookie=" + td);
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

    private static Map<String, String> req(String ip,String cookie) throws TimeoutException {

        Map<String, String> heads = new HashMap<>();
        heads.put("X-Forwarded-For", ip);
        heads.put("Accept","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
        heads.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        heads.put("Accept-Encoding", "gzip, deflate");
        heads.put("Referer","http://cn.epubee.com/files.aspx");
        heads.put("Upgrade-Insecure-Requests", "1");

        Map<String, String> response = HttpUtils.get("http://cn.epubee.com/files.aspx", cookie, heads);

        /*if (response == null || !response.get("responseCode").equals("200")) {
            response = HttpUtils.get("http://cn.epubee.com/files.aspx", cookie, heads, 3, 20000);
        }
        if (response == null || !response.get("responseCode").equals("200")) {
            logger.error("我的书籍读取失败！\n" + user.toString() + "\n");
            throw new TimeoutException("我的书籍读取失败");
        }*/
        return response;
    }

    public static void main(String[] args){
      //  UserContext user = new UserContext();
        try {
            String cookie = "identify=29027459; eidentify=D57F5DCE8F1980AFB12EBE2185A396B8; identifyusername=; user_localid=ip_122.224.117.122; uemail=; kindle_email=; isVip=0";
            Map<String, String> response = req("122.224.117.122",cookie);

            System.out.println(response);
            Matcher m = pattern.matcher(response.get("body"));
            String td = "";
            if(m.find()){
                td = m.group(1);
            }
            response = req("122.224.117.122",cookie+ "; td_cookie="+td);
            System.out.println(response);
        //    MyBook.myBook(user);
        } catch (TimeoutException e) {
            e.printStackTrace();
        }
    }

    public static byte[] unGzip(byte[] content) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(content));
        byte[] buffer = new byte[1024];
        int n;
        while ((n = gis.read(buffer)) != -1) {
            baos.write(buffer, 0, n);
        }
        return baos.toByteArray();
    }
}
