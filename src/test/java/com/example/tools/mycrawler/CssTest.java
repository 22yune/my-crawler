package com.example.tools.mycrawler;

import org.apache.commons.io.FileUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

/**
 * Created by baogen.zhang on 2019/6/26
 *
 * @author baogen.zhang
 * @date 2019/6/26
 */
public class CssTest {

    @Test
    public void test(){
        try {
            String html = FileUtils.readFileToString(new File("E:\\demo\\my-crawler\\src\\main\\resources\\model/amazon/showList2.html"));
            String select = "div span a div.p13n-sc-truncate";
            Document listPage = Jsoup.parse(html);
            Elements links = listPage.select(select);
            System.out.println(links.size());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
