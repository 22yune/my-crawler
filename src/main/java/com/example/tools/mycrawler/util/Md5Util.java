package com.example.tools.mycrawler.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @author yi_jing
 * @date 2022-06-26
 */
public class Md5Util {

    public static void recursionDel(String direct){
        //遍历得到文件所在目录下的txt文件
        File dirFile=new File(direct);
        FilenameFilter filter=new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.endsWith(".txt");
            }
        };

        List<File> list=new ArrayList<File>();
        try {
            //查找符合条件的文件
            list = getFile(dirFile, filter, list);
            //删除重复的文件，保留第一个
            for (int i = 0;i<list.size();i++){
                list.get(i).delete();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
    //获取指定目录下指定类型的文件（包括子目录）
    private static List<File> getFile(File dir,FilenameFilter filter,List<File>list)throws IOException
    {
        File[]files=dir.listFiles();
        for(File file:files)
        {
            if (file.isDirectory()) {// 如果需要对子目录查重，下面这行注释去掉
                // getFile(file, filter, list);
            }
            else {
                if(filter.accept(dir, file.getName()))//是文件则将文件放入list列表中
                    list.add(file);
            }
        }

        list = recursionCompare(list);
        return list;
    }
    //比较文件MD5值
    private static List<File> recursionCompare(List<File> list) {
        Collections.sort(list,new Comparator<File>(){
            public int compare(File o1, File o2) {
                return String.valueOf(o2.lastModified()).compareTo(String.valueOf(o1.lastModified()));
            }
        });
        int size = list.size();
        String dateStr = "";
        Calendar cal = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        //获取文件最新日期
        if(size>0){
            File fistFile = list.get(0);
            cal.setTimeInMillis(fistFile.lastModified());
            //文件的最新日期
            dateStr = sdf.format(cal.getTime());
        }

        String dateStr2 = "";
        List<File> lis = new ArrayList<>();
        //找到日期相同的文件，一旦不同，退出，避免全盘遍历
        for(File f:list){
            cal.setTimeInMillis(f.lastModified());
            dateStr2 = sdf.format(cal.getTime());
            if(dateStr.equals(dateStr2)){
                lis.add(f);
            }else{
                break;
            }
        }

        List<File> reList = new ArrayList<File>();//返回
        //如果需要对所有文件（不仅仅是最新日期的）遍历，则lis=list;
        for (int i = 0;i<lis.size();i++){
            for(int k = i+1;k<lis.size();k++){
                String str1 = getFileMD5(lis.get(i));
                String str2 = getFileMD5(lis.get(k));
                if(str1.equals(str2)){
                    reList.add(lis.get(k));
                    break;
                }
            }
        }
        //重复的文件，不包含本身
        return reList;
    }

    // 计算文件的 MD5 值
    public static String getFileMD5(File file) {
        if (!file.isFile()) {
            return null;
        }
        MessageDigest digest = null;
        FileInputStream in = null;
        byte buffer[] = new byte[8192];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            in = new FileInputStream(file);
            while ((len = in.read(buffer)) != -1) {
                digest.update(buffer, 0, len);
            }
            BigInteger bigInt = new BigInteger(1, digest.digest());
            return bigInt.toString(16);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            try {
                in.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args){
        String a = "/Volumes/android/Books/tianlang-lanzou/Z Guo Jing Ji Wen Ti Cong S - Wen Yu Yuan.azw3";
        String b = "/Volumes/android/l4/中国经济问题丛书精选（套装共13册.azw3";
        System.out.println(getFileMD5(new File(a)));
        System.out.println(getFileMD5(new File(b)));
    }

}