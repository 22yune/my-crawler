package com.example.tools.mycrawler;

/**
 * Created by baogen.zhang on 2019/6/21
 *
 * @author baogen.zhang
 * @date 2019/6/21
 */
public class Download {

    public static void main(String[] args) {
        HttpUtils.download("http://download.bookset.me/d.php?f=2019/4/%EF%BC%88%E7%BE%8E%EF%BC%89%E5%A4%A7%E5%8D%AB%C2%B7%E8%BF%AA%E8%90%A8%E6%B2%83-%E5%8F%8D%E5%A5%97%E8%B7%AF-9787559627452.azw3", "", "9787559627452.azw3", "1", "E:\\documents\\kindle\\crawler");
    }
}
