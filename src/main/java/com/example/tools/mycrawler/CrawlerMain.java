package com.example.tools.mycrawler;

import org.apache.commons.cli.*;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * Created by baogen.zhang on 2019/7/3
 *
 * @author baogen.zhang
 * @date 2019/7/3
 */
public class CrawlerMain {

    public static void main(String[] args) {
        ConfigurableApplicationContext application = new SpringApplication().run();
        options(args);
    }
    public static void options(String[] args) {
        Options options = new Options();

        //第一个参数是选项名称的缩写，第二个参数是选项名称的全称，第三个参数表示是否需要额外的输入，第四个参数表示对选项的描述信息
        Option opt_help = new Option("h", "help", false, "print help message");
        opt_help.setRequired(false);
        options.addOption(opt_help);

        Option opt_encrypt = new Option("e","encrypt",true,"encrypt the password");
        opt_encrypt.setRequired(false);
        options.addOption(opt_encrypt);

        Option opt_decrypt = new Option("d","decrypt",true,"decrypt the password");
        opt_decrypt.setRequired(false);
        options.addOption(opt_decrypt);

        Option opt_key = new Option("k" ,"key",true,"use the key to encrypt/decrypt the password");
        opt_key.setRequired(false);
        options.addOption(opt_key);

        //用来打印帮助信息
        HelpFormatter hf = new HelpFormatter();
        hf.setWidth(110);

        CommandLine commandLine = null;
        CommandLineParser parser = new DefaultParser();

        try {
            commandLine = parser.parse(options, args);
            if (commandLine.hasOption("h")) {
                hf.printHelp("xtps-common", options, true);
            }
            if(commandLine.hasOption("e")){
                String password = commandLine.getOptionValue("e");
                if(commandLine.hasOption("k")){
                    String key = commandLine.getOptionValue("k");
                //    System.out.println(XQEncrypt.encrypt(password,key));
                }else {
                //    System.out.println(XQEncrypt.encrypt(password,XQEncrypt.KEY));
                }
            }
            if(commandLine.hasOption("d")){
                String password = commandLine.getOptionValue("d");
                if(commandLine.hasOption("k")){
                    String key = commandLine.getOptionValue("k");
                 //   System.out.println(XQEncrypt.decrypt(password,key));
                }else {
                 //   System.out.println(XQEncrypt.decrypt(password,XQEncrypt.KEY));
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }
}
