package com.example.tools.mycrawler.epubee;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.example.tools.mycrawler.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class AddBook {

    private static Logger logger = LoggerFactory.getLogger(AddBook.class);

    public static boolean addBook(Book book, UserContext user) throws TimeoutException {
        Map<String, String> heads = new HashMap<>();
        heads.put("X-Forwarded-For", user.getIp());
        heads.put("Content-Type", "application/json");
        heads.put("X-Requested-With", "XMLHttpRequest");
        heads.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        heads.put("Accept-Encoding", "gzip, deflate");

        Map<String,String> map = HttpUtils.post("http://cn.epubee.com/app_books/addbook.asmx/online_addbook", null, null, heads, "{bookid:'" + book.getBid() + "',uid:" + user.getId() + ",act:'search'}",3);
        if(map.get("responseCode").equals("503")){
            throw new TimeoutException("");
        }
        try {
            JSONArray array = (JSONArray) JSON.parseObject(map.get("body")).get("d");
            if (array.size() == 0) {
                return true;
            }
        } catch (Exception e) {
            logger.error("添加失败！" + book + "\n" + map.get("body"), e);
        }
        return false;
    }

    public static void main(String[] args) throws TimeoutException {
        boolean a = AddBook.addBook(QueryBook.queryBook("数学那些事儿:思想、发现、人物和历史 (图灵新知)").get(0), new UserContext());
        System.out.println(a);
    }

}
