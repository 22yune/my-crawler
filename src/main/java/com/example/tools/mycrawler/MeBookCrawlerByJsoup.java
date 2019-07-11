package com.example.tools.mycrawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by baogen.zhang on 2019/4/28
 *
 * @author baogen.zhang
 * @date 2019/4/28
 */
@Component
public class MeBookCrawlerByJsoup {
    public static Pattern date_pattern = Pattern.compile("([0-9]{4}.[0-9]{2}.[0-9]{2})");

    public static String crawlStorageFolder;


    public static void crawlerAllSite() {

        visitPage("http://mebook.cc/", "div#container div#menu ul#menunav li", element -> {
            Elements links = element.select("ul.sub-menu li a[href]");
            PageVisit pageVisit = element1 -> {
                String title = element1.text();
                if (title.equals("首页")) {
                    return;
                }
                String href = element1.attr("href");
                try {
                    crawlerListPage("yyyy-MM-dd", title + ".txt", href, "/page/%s", 1, 0);
                } catch (Exception e) {
                    System.out.println(title + " error");
                }
            };
            if (links != null && links.size() > 0) {
                links.forEach(pageVisit::visit);
            } else {
                element.select("a[href]").forEach(pageVisit::visit);
            }


        }, 1);
    }

    public static String crawlerPageByUrl(String url) {
        final StringBuilder stringBuilder = new StringBuilder();
        String select = "div#container div#container-inner div#primary ul.list li div.content";
        visitPage(url, select, element -> {
            String title = element.select("h2 a[href]").attr("title");
            String href = element.select("h2 a[href]").attr("href");
            String date = "";
            Matcher matcher = date_pattern.matcher(element.select("div.info").text());
            if (matcher.find()) {
                date = matcher.group(1);
            }
            //  http://mebook.cc/19444.html      http://mebook.cc/download.php?id=19444
            String id = href.substring("http://mebook.cc/".length(), href.lastIndexOf(".html"));
            String downPageUrl = "http://mebook.cc/download.php?id=" + id;
            stringBuilder.append("\n");
            stringBuilder.append(date);
            stringBuilder.append("    ");
            stringBuilder.append(title);
            stringBuilder.append("\n");
            stringBuilder.append(downPageUrl);
            stringBuilder.append("\n");
            System.out.println(date + "    " + title);
            System.out.print(downPageUrl);
            stringBuilder.append(crawlerPageDownInfo(downPageUrl));
        }, 3);

        return stringBuilder.toString();
    }

    public static String crawlerPageDownInfo(String url) {
        final StringBuilder stringBuilder = new StringBuilder();
        visitPage(url, "div.list a[href]", element -> {
            String href = element.attr("href");
            if (href.indexOf("pan.baidu.com") > -1) {
                stringBuilder.append(href);
            }
        }, 3);

        if (stringBuilder.length() < 1) {
            System.out.println(url + "  error:");
            visitPage(url, "div.list a[href]", element -> {
                String href = element.attr("href");
                System.out.println("debug  " + href);
            }, 3);
        }
        visitPage(url, "div.desc p", element -> {
            String v = element.ownText();
            if (v.indexOf("网盘密码：") > -1) {
                Pattern pattern = Pattern.compile("百度网盘密码：.*? ");
                Matcher matcher = pattern.matcher(v);
                if (matcher.find()) {
                    stringBuilder.append(" ");
                    stringBuilder.append(matcher.group(0).substring("百度网盘密码：".length()));
                } else {
                    pattern = Pattern.compile("百度网盘密码：.*?");
                    matcher = pattern.matcher(v);
                    if (matcher.find()) {
                        stringBuilder.append(" ");
                        stringBuilder.append(v.substring(matcher.end()));
                    }
                }
            }
        }, 3);

        System.out.println(stringBuilder);
        return stringBuilder.toString();
    }

    public static void visitPage(String url, String select, PageVisit visit, int restry) {
        if (restry <= 0) {
            return;
        }
        try {
            Document listPage = Jsoup.connect(url).get();
            Elements links = listPage.select(select);
            links.forEach(visit::visit);
        } catch (IOException e) {
            try {
                Thread.sleep(new Random().nextInt(2000));
            } catch (InterruptedException e1) {
            }
            if (restry < 1) {
                e.printStackTrace();
                return;
            }
            visitPage(url, select, visit, restry - 1);
        }
    }


    public static void crawlerYearMonth(int year, int month) throws Exception {
        crawlerListPage("BaiduPan-" + year + "-" + month + ".txt", "http://mebook.cc/date/" + year + "/" + month, "/page/%s", 1, 1000);
    }


    public static void crawlerListPage(String fileName, String rootUrl, String format, int begin, int end) throws Exception {
        crawlerListPage("yyyy-MM-dd-HH", fileName, rootUrl, format, begin, end);
    }

    public static void crawlerListPage(String dateFormat, String fileName, String rootUrl, String format, int begin, int end) throws Exception {
        String context = " ";

        String folder = crawlStorageFolder;
        if (dateFormat != null && dateFormat.length() > 0) {
            SimpleDateFormat sdf = new SimpleDateFormat();// 格式化时间
            sdf.applyPattern(dateFormat);
            String data = sdf.format(new Date());
            folder += File.separator + data;
        }

        File dir = new File(folder);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File file = new File(dir, File.separator + fileName);
        if (!file.exists()) {
            file.createNewFile();
        }
        OutputStream outputStream = new FileOutputStream(file);

        int i = begin;
        while ((i < end || end < 1 || end < begin) && context != null && context.length() > 0) {
            context = crawlerPageByUrl(rootUrl + String.format(format, i));
            //    outputStream.write(("Page" + i).getBytes());
            outputStream.write(context.getBytes());
            outputStream.flush();
            i++;
        }
        outputStream.close();
    }

    public interface PageVisit {
        void visit(Element element);
    }
}
