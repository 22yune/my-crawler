package com.example.tools.mycrawler.baidu;

import org.jsoup.Connection;
import org.jsoup.Jsoup;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;

/**
 * Created by baogen.zhang on 2019/4/29
 *
 * @author baogen.zhang
 * @date 2019/4/29
 */
public class BaiduPanDownloadbak {

    //下载链接和提取码
    //private static String url = "https://pan.baidu.com/s/1x6q8VhFE5zzAlA5oH50wLA";
    // private static String pwd = "i076";
    //这几个参数不要动
    private static final String baseUrl = "https://pan.baidu.com/share/verify?surl=";
    private static String params = "";
    //下载参数，文件名及文件大小
    private static String server_filename = null;
    private static String size = null;
    //从cookie中获取的重要参数 核心参数
    // private static String sekey = "";

    public static void download(String url, String pwd) throws IOException {
        String downloadUrl = getDownloadUrl(url, pwd);

        System.out.println("================" + downloadUrl);
    }

    public static String getDownloadUrl(String url, String pwd) throws IOException {
        String surl = url.split("/s/1")[1];
        params += "&t=" + System.currentTimeMillis() + "channel=chunlei&web=1&app_id=230528&clienttype=0";

        Connection.Response cookieRes = Jsoup.connect(baseUrl + surl + params)
                .header("Referer", "https://pan.baidu.com/share/init?surl=" + surl)
                .data("pwd", pwd)
                .method(Connection.Method.POST)
                .ignoreContentType(true)
                .execute();
        System.out.println(cookieRes.body());
        Map<String, String> cookies = cookieRes.cookies();

        Connection.Response res2 = Jsoup.connect(url)
                .method(Connection.Method.POST)
                .cookies(cookies)
                .ignoreContentType(true)
                .execute();
        System.out.println(res2.body());

        Map<String, String> params = getBodyParams(res2.body());
        String postUrl = getPostUrl(params);
        Map<String, String> postParams = getPostData(params, getSekeyBycookies(cookies));

        Connection.Response realUrlRes = Jsoup.connect(postUrl)
                .method(Connection.Method.POST)
                .header("Referer", url)
                .cookies(cookies)
                .data(postParams)
                .ignoreContentType(true)
                .execute();

        System.out.println(realUrlRes.body());
        return parseRealDownloadURL(realUrlRes.body());
    }


    private static String getSekeyBycookies(Map<String, String> cookies) throws UnsupportedEncodingException {
        String bdclnd = cookies.get("BDCLND");
        if (null != bdclnd && !"".equals(bdclnd)) {
            return java.net.URLDecoder.decode(bdclnd, "UTF-8");
        }
        return "";
    }

    public static String getPostUrl(Map<String, String> params) {
        return GetBaiduCloudRealURL.getPostUrl(params);
    }

    public static Map<String, String> getBodyParams(String body) {
        return GetBaiduCloudRealURL.getBodyParams(body);
    }

    public static Map<String, String> getPostData(Map<String, String> params, String sekey) {
        return GetBaiduCloudRealURL.getPostData(params, sekey);
    }

    public static String parseRealDownloadURL(String responseJson) {
        return GetBaiduCloudRealURL.parseRealDownloadURL(responseJson);
    }

    public static void main(String[] args) {

        try {
            BaiduPanDownloadbak.download("http://pan.baidu.com/s/1i5L6YzV", "607i");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
