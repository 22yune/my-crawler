package com.example.tools.mycrawler;

import com.example.tools.mycrawler.lanzou.LanzouUtil;
import com.example.tools.mycrawler.library.BookLibrary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tools.zip.ZipEntry;
import org.springframework.util.StringUtils;

import java.io.*;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;


/**
 * Created by baogen.zhang on 2019/6/21
 *
 * @author baogen.zhang
 * @date 2019/6/21
 */
@Slf4j
public class Download {

    public static void main(String[] args) {
        HttpUtils.download("http://download.bookset.me/d.php?f=2019/4/%EF%BC%88%E7%BE%8E%EF%BC%89%E5%A4%A7%E5%8D%AB%C2%B7%E8%BF%AA%E8%90%A8%E6%B2%83-%E5%8F%8D%E5%A5%97%E8%B7%AF-9787559627452.azw3", "", "9787559627452.azw3", "1", "E:\\documents\\kindle\\crawler");
    }

    public static boolean download(BookFile book, Function<BookFile, Boolean> doDown, boolean rename, String bookName, boolean check, String storeDir, BookLibrary bookLibrary) {
        if (book == null) {
            return false;
        }
        String downDir = book.getDownDir();
        try {
            boolean rname = !StringUtils.isEmpty(bookName) && !isContainChinese(book.getName());
            if (rename) {
                return rname && tryRenameDownloadedFile(book.getName(), storeDir, bookName);
            }
            if (rname) {
                book.setName(bookName + book.getName().substring(book.getName().lastIndexOf(".")));
            }
            boolean r = tryCheckZip(check, book.getName(), storeDir);
            if (r) {
                doDown.apply(book);
            }
            try {
                if (r) {
                    File f = tryUnZip(book.getName(), downDir);
                    bookLibrary.addFile(f);
                }
            } catch (Exception e) {
                log.error("添加到数据出错", e);
            }
            return r;
        } catch (Exception e) {
            log.error("", e);
        }
        return false;
    }

    private static File tryUnZip(String name, String downDir) {
        File f = new File(downDir, name);
        if (name.toUpperCase().endsWith(".ZIP")) {
            String rz = upZip(f, downDir + "/unzip");
            if (rz != null && rz.length() > 0) {
                boolean d = f.delete();
                log.info("移除文件{}  {}", d ? "成功" : "失败", f.getAbsolutePath());
                f = new File(rz);
            }
        }
        return f;
    }

    private static boolean tryRenameDownloadedFile(String name, String downDir, String bookName) {
        String old = name.substring(0, name.lastIndexOf("."));
        String end = ".azw3";
        File f = new File(downDir, old + end);
        if (!f.exists()) {
            end = ".epub";
            f = new File(downDir, old + end);
        }
        if (f.exists()) {
            log.info("重命名: {} -> {}", f.getAbsolutePath(), bookName);
            return f.renameTo(new File(downDir, bookName + end));
        }
        return false;
    }

    private static boolean tryCheckZip(boolean check, String name, String storeDir) {
        if (check) {
            File file = new File(storeDir, name);
            if (file.exists()) {
                if (name.toUpperCase().endsWith(".ZIP")) {
                    Boolean r = checkZip(storeDir, name);
                    return r != null && !r;
                }
            } else {
                log.info("not exsist {}", name);
            }
            return false;
        } else {
            return true;
        }
    }

    public static boolean isContainChinese(String str) {
        Pattern p = Pattern.compile("[\u4e00-\u9fa5]");
        Matcher m = p.matcher(str);
        return m.find();
    }

    public static Boolean checkZip(String dir,String name){
        File file1 = new File(dir,name);
        if(!file1.exists()){
            return null;
        }
        try {
            ZipFile zipFile = new ZipFile(file1);
            log.info(" check zip  {} {} {}", name, zipFile.getName(), zipFile.size());
        } catch (ZipException e){
            log.error("error {} {}",name,e.getMessage());
            return false;
        }catch (IOException e) {
            log.error("error {} {}",name, e.getMessage());
            return null;
        }
        return true;
    }

    public static String upZip(File zipFile,String outDir){
        if(!zipFile.exists()){
            return null;
        }
        try {
            org.apache.tools.zip.ZipFile _zipFile = new org.apache.tools.zip.ZipFile(zipFile , "GBK") ;
            org.apache.tools.zip.ZipEntry entry = null;
            Comparator<ZipEntry> comparator = Comparator.nullsLast(Comparator.comparing(e -> LanzouUtil.Type.indexName(e.getName())));
            for(Enumeration entries = _zipFile.getEntries(); entries.hasMoreElements() ; ){
                org.apache.tools.zip.ZipEntry temp = (org.apache.tools.zip.ZipEntry)entries.nextElement() ;
                entry = comparator.compare(entry,temp) > 0 ? temp : entry;

            }
            if(entry == null){
                return null;
            }
            String enName = entry.getName();
            String name = zipFile.getName().toLowerCase().replace("zip", enName.substring(enName.lastIndexOf(".") + 1));
            File _file = new File(outDir + File.separator + name) ;
            if(entry.isDirectory() ){
                _file.mkdirs() ;
                return null;
            }else{
                File _parent = _file.getParentFile() ;
                if( !_parent.exists() ){
                    _parent.mkdirs() ;
                }
                InputStream _in = _zipFile.getInputStream(entry);
                OutputStream _out = new FileOutputStream(_file) ;
                int len = 0 ;
                byte[] _byte = new byte[1024];
                while( (len = _in.read(_byte)) > 0){
                    _out.write(_byte, 0, len);
                }
                _in.close();
                _out.flush();
                _out.close();
                log.info(" unziped  {} to {} ", zipFile.getName(), _file.getName() );
                return _file.getAbsolutePath();
            }
        } catch (ZipException e){
            log.error("unzip error {} {}",zipFile.getName(),e.getMessage());
            return "";
        }catch (IOException e) {
            log.error("unzip error {} {}",zipFile.getName(), e.getMessage());
            return null;
        }catch (Throwable throwable){
            log.error("unzip error ", throwable);
            return null;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class BookFile {
        private String name;
        private String url;
        private String downDir;
    }
}
