package com.example.tools.mycrawler.epubee;

import com.alibaba.fastjson.JSON;
import com.example.tools.mycrawler.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class QueryBook {

    private static Logger logger = LoggerFactory.getLogger(QueryBook.class);

    public static List<Book> queryBook(String bookName) throws TimeoutException {
        Map<String, String> heads = new HashMap<>();
        heads.put("Content-Type", "application/json");
        heads.put("X-Requested-With", "XMLHttpRequest");

        Map<String, String> param = new HashMap<>();
        param.put("localid", "0");
        Map<String,String> map = HttpUtils.post("http://cn.epubee.com/keys/get_ebook_list_search.asmx/getSearchList", null, null, heads, "{skey:'" + bookName + "'}",3);

        if(map.get("responseCode").equals("503")){
            throw new TimeoutException("");
        }
        try {
            return JSON.parseArray(JSON.parseObject(map.get("body")).getString("d"), Book.class);
        } catch (Exception e) {
            logger.error("查询失败！ " + bookName + "\n" + map.get("body") + "\n", e);
        }
        return Collections.emptyList();
    }

    public static void main(String[] args) throws TimeoutException {
        List<Book> a = QueryBook.queryBook("数学那些事儿:思想、发现、人物和历史 (图灵新知)");
        System.out.println(a);
    }

}
