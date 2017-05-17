import java.io.*;
import java.net.*;
import java.util.*;

public class QueryForm {

  public void postRequest(String webPage, Hashtable<String, String> ctHash){
    URL url;
    HttpURLConnection urlConn;
    DataOutputStream printout;
    BufferedReader input;
    try {
      url = new URL(webPage);
      urlConn = (HttpURLConnection) url.openConnection() ;
      urlConn.setRequestProperty("User-Agent","Simple Test dshreeve1@sheffield.ac.uk");
      urlConn.setDoOutput(true);
      // Set request method
      urlConn.setRequestMethod("POST");
      // Set request type: form filling
      urlConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
      String content = createQueryString(ctHash); // ctHash contains pairs (FORM-FIELD VALUE)
      urlConn.setRequestProperty("Content-Length", content.length() + "");
      // Send POST output.
      printout = neww DataOutputStream(urlConn.getOutputStream());
      printout.writeBytes(content);
      printout.flush();
      printout.close();
      // Get response data
      input = new BufferedReader(new InputStreamReader(urlConn.getInputStream())); // Use existing open connection
      String str;
      while (null != ((str=input.readLine())))
        System.out.println(str);
      input.close();
    } catch (MalformedURLException me) {
        System.err.println("MalformedURLException; " + me);
    } catch (IOException ioe) {
      System.err.println("IOException; " + ioe)
    }
  }

  String createQueryString(Hashtable<String, String. ctHash) {
    String content = "";
    try {
      Enumeration<String> e = ctHash.keys();
      boolean first = true;
      while (e.hasMoreElements()) {
        // For each key and value pair in the hashtable
        String key = e.nextElement();
        String value = ctHash.get(key);
        // If this is not the first key-value pair in hashtable concatentate a "+" sign to string
        if (!first) content += "+"; else first = false;
        content += "&" + key + "=" + URLEncoder.encode(value, "UTF-8");
      }
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
  }

  public static void main (String[] args) {

    Hashtable<String,String> ctHash = new Hashtable<String,String>();

    try {

      ctHash.put("q","Gottlob");
      ctHash.put("submit","Search +Documents");
      ctHash.put("cs", "1");
      QueryForm qf = new QueryForm();
      qf.postRequest("http://citeseer.ist.psu.edu/", ctHash);
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
  }




}