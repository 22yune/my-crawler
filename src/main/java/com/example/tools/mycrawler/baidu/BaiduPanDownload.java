package com.example.tools.mycrawler.baidu;

import com.alibaba.fastjson.JSON;
import org.jsoup.Connection;
import org.jsoup.Jsoup;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by baogen.zhang on 2019/4/29
 *
 * @author baogen.zhang
 * @date 2019/4/29
 */
public class BaiduPanDownload {

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

    public static String getPostUrl(Map<String, String> params) {
        StringBuffer sb1 = new StringBuffer();
        sb1.append("https://pan.baidu.com/api/sharedownload?");
        sb1.append("sign=" + params.get("sign"));
        sb1.append("&timestamp=" + params.get("timestamp"));
        sb1.append("&channel=chunlei");
        sb1.append("&web=1");
        sb1.append("&app_id=" + params.get("app_id"));
        sb1.append("&clienttype=0");
        String post_url = sb1.toString();
        return post_url;
    }

    public static Map<String, String> getBodyParams(String body) {
        Map<String, String> map = new HashMap<String, String>();

        String setData = "";
        Pattern pattern_setData = Pattern.compile("setData.*?;");
        Matcher matcher_setData = pattern_setData.matcher(body);
        if (matcher_setData.find()) {
            String tmp = matcher_setData.group(0);
            setData = tmp.substring(8, tmp.length() - 2);
            SetDataBean bean = JSON.parseObject(setData, SetDataBean.class);
            map.put("sign", bean.getSign());
            map.put("timestamp", bean.getTimestamp());
            map.put("bdstoken", bean.getBdstoken());
            map.put("app_id", bean.getFile_list().getList()[0].getApp_id());
            map.put("uk", bean.getUk());
            map.put("shareid", bean.getShareid());
            map.put("primaryid", bean.getShareid());
            map.put("fs_id", bean.getFile_list().getList()[0].getFs_id());
            map.put("fid_list", bean.getFile_list().getList()[0].getFs_id());
            map.put("server_filename", bean.getFile_list().getList()[0].getServer_filename());
            map.put("size", bean.getFile_list().getList()[0].getSize());
//			map.put("logid", logid);
        }
        return map;
    }

    private static String getSekeyBycookies(Map<String, String> cookies) throws UnsupportedEncodingException {
        String bdclnd = cookies.get("BDCLND");
        if (null != bdclnd && !"".equals(bdclnd)) {
            return java.net.URLDecoder.decode(bdclnd, "UTF-8");
        }
        return "";
    }

    public static Map<String, String> getPostData(Map<String, String> params, String sekey) {
        // POST携带的参数(抓包可看到)
        Map<String, String> data = new HashMap<String, String>();
        data.put("encrypt", "0");
        data.put("product", "share");
        data.put("uk", params.get("uk"));
        data.put("primaryid", params.get("primaryid"));
        // 添加了[]
        data.put("fid_list", "[" + params.get("fid_list") + "]");
        data.put("path_list", "");// 可以不写
        data.put("extra", "{\"sekey\":\"" + sekey + "\"}");
        return data;
    }

    public static String parseRealDownloadURL(String responseJson) {
        String realURL = "";
        Pattern pattern = Pattern.compile("\"dlink\":.*?,");
        Matcher matcher = pattern.matcher(responseJson);
        if (matcher.find()) {
            String tmp = matcher.group(0);
            String dlink = tmp.substring(9, tmp.length() - 2);
            realURL = dlink.replaceAll("\\\\", "");
        }
        return realURL;
    }

    public static void main(String[] args) {
        try {
            BaiduPanDownload.download("http://pan.baidu.com/s/1i5jBNbJ", "izwn");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
