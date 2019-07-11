package com.example.tools.mycrawler;

import java.awt.*;
import java.awt.datatransfer.*;
import java.io.*;
import java.util.Arrays;
import java.util.regex.Matcher;

/**
 * Created by baogen.zhang on 2019/5/13
 *
 * @author baogen.zhang
 * @date 2019/5/13
 */
public class ClipBoardUtil {
    public static void main(String[] args) {

        //   readDir("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-13-10");
        //    readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\中亚官方合集资源下载.txt"),1743,0,null,"2016.11.06");
        //    readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\经典名著·社会哲学.txt"),129,0,"2017.11.01",null);
        /*readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\军事科学·历史地理.txt"),0,0,"2017.11.01",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\科幻悬疑·恐怖惊悚.txt"),0,0,"2017.11.01",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\现代文学·励志鸡汤.txt"),0,0,"2017.11.01",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\官场商战·人生百态.txt"),0,0,"2017.11.01",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\美工设计.txt"),0,0,null,null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\原版书籍.txt"),0,0,null,null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\语言学习.txt"),0,0,null,null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\甲骨文系列丛书.txt"),0,0,null,null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\编程开发.txt"),63,0,null,null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\人物传记·旅行见闻.txt"),0,0,"2017.10.18",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\生活养生·运动健身.txt"),0,0,"2017.11.01",null);
        */
        //    readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\现代文学·励志鸡汤.txt"),0,0,"2017.11.01",null);
        readFile(new File("E:\\documents\\kindle\\crawler\\MeBook\\2019-05-15 - 副本\\其他站点合集资源下载.txt"), 0, 0, null, "2016.11.01");
    }


    public static void readDir(String dir) {

        File file = new File(dir);

        Arrays.stream(file.listFiles()).forEach(file1 -> readFile(file1));
    }

    public static void readFile(String file1) {
        readFile(new File(file1));
    }

    public static void readFile(String file1, String begin, String end) {
        readFile(new File(file1), 1, 0, begin, end);
    }

    public static void readFile(String file1, int begin, int end) {
        readFile(new File(file1), begin, end, null, null);
    }

    public static void readFile(File file1) {
        readFile(file1, 1, 0, null, null);
    }

    public static void readFile(File file1, int begin, int end, String begDate, String endDate) {
        try {
            System.out.println(file1.getAbsolutePath());
            BufferedReader reader = new BufferedReader(new FileReader(file1));
            String a = null;
            int i = 0;
            String date = "";
            Boolean matchFormat = false;
            boolean start = false;
            while ((a = reader.readLine()) != null) {
                System.out.println(i++ + "    " + a);
                if (begin != 0 && i < begin) {
                    continue;
                }
                if (end != 0 && i > end) {
                    break;
                }
                if ((i - 1) % 3 == 1) {
                    Matcher matcher = MeBookCrawlerByJsoup.date_pattern.matcher(a);
                    if (matcher.find()) {
                        date = matcher.group(1);
                    }
                    if (a.toLowerCase().indexOf("mobi") > -1 || a.toLowerCase().indexOf("azw3") > -1) {
                        matchFormat = true;
                    } else {
                        matchFormat = false;
                    }
                }
                if (i == 1 || (i - 1) % 3 != 0) {
                    continue;
                }
                if (begDate != null && date != null && date.length() > 0 && date.compareTo(begDate) < 0) {
                    break;
                }
                if (endDate != null && date.compareTo(endDate) > 0) {
                    continue;
                }
                if (!matchFormat) {
                    continue;
                }
                setSysClipboardText(a);
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                if (!start) {
                    //   start = true;
                    int read = new BufferedReader(new InputStreamReader(System.in)).read();
                    while (read != 10) {
                        read = new BufferedReader(new InputStreamReader(System.in)).read();
                    }
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getSysClipboardText() {
        String ret = "";
        Clipboard sysClip = Toolkit.getDefaultToolkit().getSystemClipboard();
        // 获取剪切板中的内容
        Transferable clipTf = sysClip.getContents(null);

        if (clipTf != null) {
            // 检查内容是否是文本类型
            if (clipTf.isDataFlavorSupported(DataFlavor.stringFlavor)) {
                try {
                    ret = (String) clipTf
                            .getTransferData(DataFlavor.stringFlavor);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        return ret;
    }


    public static void setSysClipboardText(String writeMe) {
        Clipboard clip = Toolkit.getDefaultToolkit().getSystemClipboard();
        Transferable tText = new StringSelection(writeMe);
        clip.setContents(tText, null);
    }


    public static Image getImageFromClipboard() throws Exception {
        Clipboard sysc = Toolkit.getDefaultToolkit().getSystemClipboard();
        Transferable cc = sysc.getContents(null);
        if (cc == null) {
            return null;
        } else if (cc.isDataFlavorSupported(DataFlavor.imageFlavor)) {
            return (Image) cc.getTransferData(DataFlavor.imageFlavor);
        }
        return null;
    }


    public static void setClipboardImage(final Image image) {
        Transferable trans = new Transferable() {
            @Override
            public DataFlavor[] getTransferDataFlavors() {
                return new DataFlavor[]{DataFlavor.imageFlavor};
            }

            @Override
            public boolean isDataFlavorSupported(DataFlavor flavor) {
                return DataFlavor.imageFlavor.equals(flavor);
            }

            @Override
            public Object getTransferData(DataFlavor flavor)
                    throws UnsupportedFlavorException, IOException {
                if (isDataFlavorSupported(flavor)) {
                    return image;
                }
                throw new UnsupportedFlavorException(flavor);
            }

        };
        Toolkit.getDefaultToolkit().getSystemClipboard().setContents(trans,
                null);
    }
}
