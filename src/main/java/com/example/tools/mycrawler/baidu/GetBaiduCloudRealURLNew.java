package com.example.tools.mycrawler.baidu;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.tools.mycrawler.HttpUtils;
import com.example.tools.mycrawler.baidu.entity.YunData;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 输入百度网盘的资源地址，获取网盘的真实下载地址。
 *
 * @author gaoqiang
 */
public class GetBaiduCloudRealURLNew { // 定义一些全局变量

    private static Logger logger = LoggerFactory.getLogger(GetBaiduCloudRealURLNew.class);

    private static final String getvcodeURL = "https://pan.baidu.com/api/getvcode?prod=pan";// 请求vcode地址，不变


    public static void main(String[] args) {
        String url = "https://yun.baidu.com/s/1nt5etyp";
        if (args.length > 0) {
            System.out.println("输入的原始地址：" + args[0]);
            url = args[0];
        }
        try {
            download(url, true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void download(String url, boolean isDownload) throws IOException {
        YunData yunData = visitResource(url);

        String realURL = getRealDownLoadUrl(yunData);

        doDownload(yunData, isDownload, realURL, "");
    }

    /**
     * 下载文件
     *
     * @param yunData
     * @param isDownload
     * @param realURL
     */

    public static void doDownload(YunData yunData, boolean isDownload, String realURL, String dir) {
        if (isDownload) {
            System.out.println("正在下载文件...");
            String server_filename = yunData.getFile_list().getList().get(0).getServer_filename();
            String size = yunData.getFile_list().getList().get(0).getSize();
            HttpUtils.download(realURL, yunData.getCookie(), server_filename, size, dir);// 进行下载
        } else {
            System.out.println("配置不下载");
        }
    }

    /**
     * 打开百度网盘资源页面
     * 获取cookie等资源信息
     */

    public static YunData visitResource(String url) throws IOException {
        Connection.Response openPage = Jsoup.connect(url).method(Connection.Method.GET).execute();
        System.out.println("服务器返回的cookie：\n" + JSON.toJSONString(openPage.cookies(), true) + "\n");
        YunData yunData = getSetData(openPage.body());
        //    String cookie = "PANWEB=1;" + JSON.toJSONString(openPage.cookies()).split(";")[0];// 抓包看到携带了PANWEB1，不设置也没问题

        openPage.cookies().entrySet().stream().forEach(stringStringEntry -> {
        });
        yunData.setCookies(openPage.cookies());
        return yunData;
    }

    /**
     * 正则匹配出json字符串，将json字符串转化为java对象。
     */
    public static YunData getSetData(String body) {
        Pattern pattern_setData = Pattern.compile("setData.*?;");
        Matcher matcher_setData = pattern_setData.matcher(body);
        if (matcher_setData.find()) {
            String tmp = matcher_setData.group(0);
            String setData = tmp.substring(8, tmp.length() - 2);
            System.out.println("setData:" + setData + "\n");
            YunData bean = JSON.parseObject(setData, YunData.class);
            return bean;
        }
        return null;
    }

    /**
     * 发送请求获取资源下载地址
     * <p>
     * post请求（抓包可看到） 抓包看到logid，实际测试logid不携带也可以正常抓取
     * * https://pan.baidu.com/api/sharedownload?sign=57b1d77e118738b6d6792a5aa2ee8d6c4f93a213&timestamp=1556534453&channel=chunlei&web=1&app_id=250528&bdstoken=251eb2205350aed0ced340195e680224&logid=MTU1NjUzNDQ2MjgyMzAuODQ2NTk2MDUzMzM4NzU2OQ==&clienttype=0
     * <p>
     * var url="/api/sharedownload?sign="+yunData.SIGN+"&timestamp="+yunData.TIMESTAMP;
     * * var param="encrypt=0&product=share&uk="+yunData.SHARE_UK+"&primaryid="+yunData.SHARE_ID+"&fid_list=%5B"+yunData.FS_ID+"%5D";
     * * $.post(url,param,function(data){datas=data;
     * *     console.log('真实下载地址：');
     * *     console.log(data.list[0].dlink);
     * * })
     *
     * @return
     */
    public static String getRealDownLoadUrl(YunData yunData) throws IOException {
        // 拼接post的url地址
        String post_url = "https://pan.baidu.com/api/sharedownload?" + "sign=" + yunData.getSign() + "&timestamp=" + yunData.getTimestamp();
        Map<String, String> data = new HashMap<String, String>();
        data.put("encrypt", "0");
        data.put("product", "share");
        data.put("uk", yunData.getUk());
        data.put("primaryid", yunData.getShareid());
        // 添加了[]，解码就是%5B %5D
        data.put("fid_list", "%5B" + yunData.getFile_list().getList().get(0).getFs_id() + "%5D");
        //  data.put("path_list", "");// 可以不写
        //   data.put("vip","0");
        // 带提取码的情况
        String sekey = null;
        if (sekey != null) {
            data.put("extra", "{\"sekey\":\"" + sekey + "\"}");
        }

        Connection.Response downPage = Jsoup.connect(post_url)
                .data(data).cookies(yunData.getCookies())
                .method(Connection.Method.POST)
                .ignoreContentType(true)
                .execute();
        String responseJson = downPage.body();
        System.out.println(responseJson + "\n");
        Response20 response20 = JSON.parseObject(responseJson, Response20.class);
        String errorCode = response20.getErrno();
        int count = 0;
        while (!errorCode.equals("0") && count < 5) {
            count++;
            if (errorCode.equals("-20")) { // 下载超过3次，需要验证码,获取vcode和img地址
                Map<String, String> generateValidateCode = generateValidateCode(count, yunData.getCookie());
                data.put("vcode_input", generateValidateCode.get("vcode_input"));
                data.put("vcode_str", generateValidateCode.get("vcode_str"));
                downPage = Jsoup.connect(post_url)
                        .data(data).cookies(yunData.getCookies())
                        .method(Connection.Method.POST)
                        .ignoreContentType(true)
                        .execute();
                String responseJsonCode = downPage.body();
                System.out.println(responseJsonCode + "\n");
                errorCode = JSON.parseObject(responseJsonCode, Response20.class).getErrno();
                if (errorCode.equals("0")) {
                    responseJson = responseJsonCode;
                }
            }
        }

        if (errorCode.equals("0")) {// 成功返回真实的url
            return (String) ((JSONObject) ((JSONArray) JSON.parseObject(responseJson).get("list")).get(0)).get("dlink");
        } else {
            System.out.println("尝试了" + count + "次，地址获取失败");
            return "";
        }
    }


    /**
     * 获取并输入验证码
     *
     * @return map{vcode_str:请求的vcode值, vcode_input:输入的验证码}
     */
    public static Map<String, String> generateValidateCode(int count, String cookie) { // 下载超过3次，需要验证码,获取vcode和img地址
        Map<String, String> vcodeResponse = HttpUtils.get(getvcodeURL, cookie);
        String res = vcodeResponse.get("body");
        System.out.println("获取vcode：" + vcodeResponse.get("body"));
        Response20 responseVcode = JSON.parseObject(res, Response20.class);
        String vcode = responseVcode.getVcode();
        String imgURL = responseVcode.getImg();
        System.out.println("vcode值：" + vcode);
        System.out.println("验证码地址：" + imgURL); // 请求验证码
        HttpUtils.saveImage(imgURL, cookie);
        System.out.print("查看图片，输入验证码(第" + count + "次尝试/共5次):");
        InputStreamReader is_reader = new InputStreamReader(System.in);
        Map<String, String> map = new HashMap<String, String>();
        try {
            String result = new BufferedReader(is_reader).readLine();
            System.out.println("输入的验证码为：" + result + "\n");
            map.put("vcode_str", vcode);
            map.put("vcode_input", result);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return map;
    }

}
