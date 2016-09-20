---
layout: post
title: "Automatic, Repetitive Tasks in WordPress with Azure Scheduler"
date: 2015-10-31
---

One of the sometimes awkward things about building WordPress sites is it can be difficult to perform automated, repetitive tasks. Something like cleaning the database every week or sending an email at the end of the day to provide a summary of the day's activity. Sure, we can use `wp_cron` but that can be over the top.

Previously I've seen and even used hack jobs like manually logging page hits, storing a limit in the `wp_options` table and once it reaches a certain threshold it will fire an event. Or even setting a timestamp and waiting for a visitor to access the site after that timestamp to trigger the event. And then they'll likely sit there frustrated at the abnormally slow page load. Real sucky, hey!

Well, that's where something like [Azure Scheduler](http://azure.microsoft.com/en-us/documentation/services/scheduler/) can be really handy. Azure Scheduler gives us the power to basically ping an endpoint with an HTTP request containing headers, body or even credentials. Something like a standard GET, POST, UPDATE or DELETE request at set intervals or a set time of day.

### Why use Azure Scheduler?
There's many services out there that already do this kind of thing but Azure Scheduler gives us 3600 free requests a month and if you're already hosting your WordPress installation on Azure, why not use something built in?

The other cool thing we can do is see a detailed log containing the history of the requests, whether they were successful and what response they returned. Unfortunately though, at the time of writing, it is not possible to return anything other than a [200 OK response](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success) with `wp_send_json()`, regardless of whether the email was sent successfully or not but we can still check the body to diagnose when or why a failure may have occurred.

### Building the WordPress EndPoint
I'm going to show you how to send a nightly email that rounds up the day's comments.

We're going to use a handy feature in WordPress - the `wp_ajax_nopriv_(option)` function. This allows us to create a unique endpoint using a function which can take a bunch of optional parameters (such as the email address), process the request and return a JSON response using `wp_send_json()`.

In order to create the endpoint, we need to build the function which will act like a controller and then expose that function through an endpoint. Best way to do this in a real world site is to [create a plugin](https://codex.wordpress.org/Writing_a_Plugin), but for the purpose of this exercise were just going to add it to our standard `functions.php` file in the root of our theme folder.

### functions.php
<script src="https://gist.github.com/NickBrooks/1e2da16022db9c2905ab.js"></script>

There are two functions here, the first `getDailyCommentSummary()` will do as it says and the second `sendDailyCommentSummary()` will verify an email address has been provided, call the first function, build the email body and attempt to send an email to the specified email address, returning the result of that attempt using `wp_send_json()`.

### Testing the endpoint
To test the endpoint we're going to use everyone's favourite API tool, [Postman](https://www.getpostman.com/). With Postman we can test the endpoint by sending a request and viewing the JSON response.

The endpoint URL we need to access uses the `action` query string, and we'll provide our own `email` parameter like this:

`wp_ajax_noprov_XXXXX()` = `http://yourwebsite.com/wp-admin/admin-ajax.php?action=XXXXX&email=your@email.com`

So, for us that means the URL we will be using will be: `http://yourwebsite.com/wp-admin/admin-ajax.php?action=sendDailyCommentSummary&email=your@email.com`

Send a [GET](http://www.w3schools.com/tags/ref_httpmethods.asp) request in Postman like this.

![Send Postman Request](https://i.imgur.com/kFwNray.png)

Our Wordpress site responds by telling us the email was successfully sent, taking 1432ms to complete the request. Looking at our Gmail Inbox I can see the resulting email.

![Received Email](https://i.imgur.com/buIIMUc.png)

### Setting up Azure Scheduler to hit the endpoint daily
Firstly, you'll need to log into the [Azure Management Portal](https://manage.windowsazure.com/), and then select **Scheduler**. I'm using the old portal for this but the concept is the same in the new portal:

![Select Scheduler](https://i.imgur.com/PkxIZHd.png)

Next, hit the **+** button at the bottom to create a new resource. We'll need to go **App Services** > **Scheduler** > **Custom Create**.

![Custom Create](https://i.imgur.com/2QrpOws.png)

Select the region, in this case Australia Southeast for me, and then create a new name for the job collection.

![Create new Job Collection](https://i.imgur.com/nrLfhII.png)

Next, give the job a name. I've simply called it the same function that we are exposing in WordPress. We'll be firing an **HTTP, GET Request** and in the URL we'll need to enter the URL we tested in Postman.

![Give job a name](https://i.imgur.com/pW7iPTz.png)

Set the Schedule to run at 5pm everyday. I've got this only running for a month but you can change that to run as long as you like.

![Set schedule](https://i.imgur.com/EO9FS2N.png)

After a minute or so, you'll see the new job has been created!

![Job created!](https://i.imgur.com/JCYVOD8.png)

### Tracking the results

Opening up the **Job Collection** > **History**, selecting a Job attempt and clicking **View History Details** we should see the result of the request.

<script src="https://gist.github.com/NickBrooks/00259c1bea9d90aedc59.js"></script>

The part we are interested in is `Body: {"success":true,"data":"The email was sent"}` which is the body of the `wp_send_json()` response we created. You should also be able to see the email in your Inbox!

### Summary & Footnotes
There's a few important things to remember when doing this kind of thing.

* Utilising the standard `wp_send_json()` function is not a proper RESTful service, but you can code similar functionality yourself using a combination of the built in WordPress `wp_send_json_success()` and `wp_send_json_error()` functions, as well as returning your own data.
* You shouldn't expose sensitive data this way as there is no way to authenticate the request Azure Scheduler makes, the closest would probably be hard coding an authentication token into the function and sending it as another query parameter, but this is still not proper auth.