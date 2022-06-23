package com.example.tools.mycrawler;

/**
 * Created by baogen.zhang on 2019/4/29
 *
 * @author baogen.zhang
 * @date 2019/4/29
 */

import com.example.tools.mycrawler.baidu.UnitSwitch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

public class HttpUtils {
    private static Logger logger = LoggerFactory.getLogger(HttpUtils.class);

    public static Map<String, String> get(String url, String cookie) {
        return get(url, cookie, null);
    }

    /**
     * 向指定URL发送GET方法的请求 返回cookie，body等
     * 会返回流里面的内容，如果下载大文件，需要修改，实时保存，避免内存溢出
     */
    public static Map<String, String> get(String url, String cookie, Map<String, String> heads) {
        return get(url, cookie, heads, 3, 5000);
    }

    public static Map<String, String> get(String url, String cookie, Map<String, String> heads, int retry, int timeOut) {
        BufferedReader in = null;
        Map<String, String> map = new HashMap<String, String>();
        try {
            URL realUrl = new URL(url); // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection(); // 设置通用的请求属性
            ((HttpURLConnection) connection).setInstanceFollowRedirects(false);
            if(heads == null || !heads.containsKey("Accept")){
                connection.setRequestProperty("Accept", "*/*");
            }
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0");

            connection.setConnectTimeout(timeOut);
            connection.setReadTimeout(timeOut);
            if (null != cookie) { //System.out.println("携带的Cookie:" + cookie);
                connection.setRequestProperty("Cookie", cookie);
            }
            if (heads != null) {
                heads.forEach((k, v) -> connection.setRequestProperty(k, v));
            }
            // 建立实际的连接
            connection.connect(); // 定义 BufferedReader输入流来读取URL的响应
            String encode = connection.getHeaderField("Content-Encoding");
            String charset = connection.getHeaderField("Content-Type");
            InputStream inpt = connection.getInputStream();
            if("gzip".equalsIgnoreCase(encode)){
                inpt = new GZIPInputStream(inpt);
            }
            in = new BufferedReader(new InputStreamReader(inpt,"utf-8"));
            StringBuffer sb = new StringBuffer();
            String line;
            while ((line = in.readLine()) != null) {
                sb.append(line + "\n"); //System.out.println("内容：" + line);
            }
            List<String> cc = connection.getHeaderFields().get("Set-Cookie");
            StringBuilder c = new StringBuilder();
            if(cc != null){
                for(String i : cc){
                    c.append(i);
                    c.append(";;");
                }
            }
         //   String c = connection.getHeaderField("Set-Cookie");
            map.put("Location", connection.getHeaderField("Location"));
            map.put("cookie", c.toString());
            map.put("body", sb.toString());
            map.put("responseCode", ((HttpURLConnection) connection).getResponseCode() + "");
            return map;
        } catch (Exception e) {
            if (e instanceof SocketTimeoutException && retry > 0) {
                logger.error(url + "请求超时" + timeOut + ".将翻倍重试。" + e.getMessage());
                return get(url, cookie, heads, retry - 1, timeOut * 2);
            } else {
                logger.error(e.getMessage(), e);
            }
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 保存验证码
     */
    public static Map<String, String> saveImage(String url, String cookie) {
        Map<String, String> map = new HashMap<String, String>();
        InputStream in = null;
        FileOutputStream fos = null;
        try {
            URL realUrl = new URL(url); // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection(); // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            if (null != cookie) {
                connection.setRequestProperty("Cookie", cookie);
            } // 建立实际的连接
            connection.connect();
            in = connection.getInputStream();
            fos = new FileOutputStream("img.jpeg");
            int b;
            while ((b = in.read()) != -1) {
                fos.write(b);
            }
            return map;
        } catch (Exception e) {
            System.err.println(e.getMessage());
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return null;
    }

    static int downloadSize = 0;
    static boolean isReading = false;//是否在读流，更新进度
    static long startTime = 0;
    static long endTime = 0;

    /**
     * 下载文件
     */
    public static Map<String, String> download(String url, String cookie, String filename,
                                               final String totalSize, String dir) {
        return download(url, cookie, null, filename, totalSize, dir);
    }

    public static Map<String, String> download(String url, String cookie, String ip, String filename,
                                               final String totalSize, String dir) {
        return download(url, cookie, ip, filename, totalSize, dir,null);
    }
    public static Map<String, String> download(String url, String cookie, String ip, String filename,
        final String totalSize, String dir, Map<String, String> heads) {
        InputStream in = null;
        FileOutputStream fos = null;
        Map<String, String> map = new HashMap<String, String>();
        try {
            URL realUrl = new URL(url); // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection(); // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(5000);
            if (null != cookie) {
                connection.setRequestProperty("Cookie", cookie);
            }
            if (ip != null) {
                connection.setRequestProperty("X-Forwarded-For", ip);
            }
            if (heads != null) {
                heads.forEach((k, v) -> connection.setRequestProperty(k, v));
            }
            // 建立实际的连接
            connection.connect();
            in = connection.getInputStream();

            File file = null;
            if (dir == null || dir.length() == 0) {
                file = new File(filename);
            } else {
                File p = new File(dir);
                if (!p.exists()) {
                    p.mkdirs();
                }
                file = new File(p, filename);
            }
            fos = new FileOutputStream(file);
            System.out.println("保存文件名称：" + file.getAbsolutePath());
            System.out.println("文件总大小：" + totalSize); //利用字符数组读取流数据
            startTime = System.currentTimeMillis(); //每隔1s读一次数据
            new Thread() {
                @Override
                public void run() {
                    String total = UnitSwitch.formatSize(Long.parseLong(totalSize));
                    StringBuffer sb = new StringBuffer();
                    for (int i = 0; i < 20; i++) {
                        sb.append("\b");
                    }
                    while (isReading) {
                        endTime = System.currentTimeMillis();
                        String speed = UnitSwitch.calculateSpeed(downloadSize, endTime - startTime);
                        System.out.println(UnitSwitch.formatSize(downloadSize) + "/" + total + "，平均下载速率：" + speed);
                        try {
                            sleep(2000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }.start();
            isReading = true;
            int len;
            byte[] arr = new byte[1024 * 8];
            while ((len = in.read(arr)) != -1) {
                fos.write(arr, 0, len);
                downloadSize += len;
            }
            endTime = System.currentTimeMillis();
            String speed = UnitSwitch.calculateSpeed(downloadSize, endTime - startTime);
            String total = UnitSwitch.formatSize(Long.parseLong(totalSize));
            System.out.println(UnitSwitch.formatSize(downloadSize) + "/" + total + "，平均下载速率：" + speed);
            System.out.println("下载完成，总耗时：" + (endTime - startTime) / 1000 + "秒." + filename);
            map.put("code", "0");
            return map;
        } catch (Exception e) {
            System.err.println(e.getMessage());
        } finally {
            isReading = false;
            try {
                if (in != null) {
                    in.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 发送HttpPost请求
     *
     * @param strURL 服务地址
     * @param params
     * @return 成功:返回json字符串<br/>
     */
    public static String post(String strURL, Map<String, String> params, String cookie) {
        return post(strURL, params, cookie, null, null,1).get("body");
    }


    /**
     * 将请求字段转化成byte数组
     *
     * @param params
     * @return
     */
    private static byte[] getParamsByte(Map<String, String> params) {
        byte[] result = null;
        StringBuilder postData = new StringBuilder();
        for (Map.Entry<String, String> param : params.entrySet()) {
            if (postData.length() != 0) {
                postData.append('&');
            }
            postData.append(encodeParam(param.getKey()));
            postData.append('=');
            postData.append(encodeParam(param.getValue()));
        }
        try {
            result = postData.toString().getBytes("UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return result;
    }
    /**
     * 对键和值进行url编码
     *
     * @param data
     * @return
     */
    private static String encodeParam(String data) {
        String result = "";
        try {
            result = URLEncoder.encode(data, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return result;
    }
    public static Map<String,String> post(String strURL, Map<String, String> params, String cookie, Map<String, String> heads, String body, int retry) {
        return post(strURL, params, null, cookie, heads, body, retry);
    }
    public static Map<String,String> post(String strURL, Map<String, String> params, Map<String, String> formParams, String cookie, Map<String, String> heads, String body, int retry) {
        try {
            URL url = new URL(strURL);// 创建连接
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestMethod("POST"); // 设置请求方式
            connection.setRequestProperty("Accept", "*/*"); // 设置接收数据的格式 // 设置发送数据的格式
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:66.0) Gecko/20100101 Firefox/66.0");

            if (null != cookie) {
                logger.info("携带的Cookie:" + cookie);
                connection.setRequestProperty("Cookie", cookie);
            }
            if (heads != null) {
                heads.forEach((k, v) -> connection.setRequestProperty(k, v));
            }
            if (heads == null || !heads.containsKey("Content-Type")) {
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            }
            connection.connect();
            OutputStreamWriter out = new OutputStreamWriter(connection.getOutputStream(), "UTF-8"); // utf-8编码

            if (params != null) {
                StringBuffer sb = new StringBuffer();
                for (String s : params.keySet()) {
                    sb.append(s + "=" + params.get(s) + "&");
                }
                sb.deleteCharAt(sb.length() - 1);
                logger.info("携带的参数：" + sb);
                out.append(sb);
            }
            if (body != null) {
                logger.info("请求主体：" + body);
                out.write(body);
            }
            if(formParams != null){
                logger.info("form参数：" + formParams);
                connection.getOutputStream().write(getParamsByte(formParams));
            }
            out.flush();
            out.close();
            int code = connection.getResponseCode();
            BufferedReader in = null;
            if (code == 200) {
                in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            }else if(retry > 0){
                return post(strURL, params, cookie, heads, body, retry - 1);
            } else {
                in = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
            }
            logger.info("响应码：" + code); // 定义BufferedReader输入流来读取URL的响应
            String line;
            StringBuffer sb1 = new StringBuffer();
            while ((line = in.readLine()) != null) {
                sb1.append(line);
            };
            Map<String,String> map = new HashMap();
            map.put("body", sb1.toString());
            map.put("responseCode", code+ "");
            return map;
        } catch (IOException e) {
            if(retry > 0){
                return post(strURL, params, cookie, heads, body, retry - 1);
            }
            System.err.println(e.getMessage());
            Map<String,String> map = new HashMap();
            map.put("body", "error");
            map.put("responseCode", "");
            return map;
        }
    }
}

