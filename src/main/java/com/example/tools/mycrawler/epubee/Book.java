package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.BookFormat;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class Book {
    private String title;
    private String author;
    private String level;
    private Double levelNum;
    private String price;
    private String readUrl;
    private String size;
    private String bid;
    private BookFormat format;
    private String downLoadUrl;

    @Override
    public String toString() {
        return title + "   " + author + "   " + level + "   " + price + "   " + "   " + format + "   " + size  + "\n" + downLoadUrl;
    }

    public Book() {

    }

    public Book(String bid, String title, String size, BookFormat format, String readUrl, String downLoadUrl) {
        this.bid = bid;
        this.title = title;
        this.size = size;
        this.format = format;
        this.readUrl = readUrl;
        this.downLoadUrl = downLoadUrl;
    }

    public Book(String title, String author, String level, String price, String readUrl) {
        this.title = title;
        this.author = author;
        this.level = level;
        this.price = price;
        this.readUrl = readUrl;
    }

    public void copyInfo(Book book) {
        if (this.title == null || this.title.length() == 0) {
            this.title = book.title;
        }
        this.author = book.author;
        this.level = book.level;
        this.price = book.price;
        this.readUrl = book.readUrl;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getDownLoadUrl() {
        return downLoadUrl;
    }

    public void setDownLoadUrl(String downLoadUrl) {
        this.downLoadUrl = downLoadUrl;
    }

    public String getReadUrl() {
        return readUrl;
    }

    public void setReadUrl(String readUrl) {
        this.readUrl = readUrl;
    }

    public String getBid() {
        return bid;
    }

    public void setBid(String bid) {
        this.bid = bid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        int i = title.lastIndexOf("[");
        if (i > -1) {
            setFormat(BookFormat.valueOf(title.substring(i + 2, title.length() - 1).toUpperCase()));
            title = title.substring(0, i);
        }
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
        try {
            setLevelNum(Double.valueOf(level.substring(3, 6)));
        } catch (Exception e) {

        }
    }

    public Double getLevelNum() {
        return levelNum;
    }

    public void setLevelNum(Double levelNum) {
        this.levelNum = levelNum;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public BookFormat getFormat() {
        return format;
    }

    public void setFormat(BookFormat format) {
        this.format = format;
    }
}
