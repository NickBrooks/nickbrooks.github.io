---
layout: post
title: "Backup a MySQL VM to Azure Storage using Powershell"
date: 2015-12-17
hero: //i.imgur.com/UOcO9Fg.jpg
---

Azure is [kick arse for many reasons](//worldsgreatestazuredemo.com/), we know that. But one area it can make you a little irate is when you're dealing with MySQL databases.

Basically, you have two options if you want to host a MySQL database on Azure:

* Host on [ClearDB](//www.cleardb.com/pricing.view) through Azure (the 3rd party PaaS option)
* Build your [own shiny, new Virtual Machine](//azure.microsoft.com/en-us/documentation/articles/virtual-machines-mysql-windows-server-2008r2/) (the IaaS option)

Originally I was using the former. It's *convenient* but it wasn't the best option for me. Why? Firstly, the perf can be a little lacklustre at lower price points and secondly, I wanted a little more control which I could get through a VM (though having [too much control can sometimes be a negative](//www.troyhunt.com/2014/01/with-great-azure-vm-comes-great.html)!).

One thing the ClearDB solution does do quite well out of the box though is backups! So, to solve this on the VM I wrote a Powershell script which does the following:

1. Dumps all the databases on our MySQL server into a folder we temporarily create.
2. Zips said folder.
3. Uploads zip file to a specified [storage account on Azure](//azure.microsoft.com/en-us/documentation/articles/storage-create-storage-account/).
4. Deletes both the created folder and the created zip file.

> Note, you'll need to install [Azure Powershell](//azure.microsoft.com/en-us/documentation/articles/powershell-install-configure/) on the VM.

### The script
<script src="//gist.github.com/NickBrooks/1573be04c7fbb806fa97.js"></script>

### Executing the script

My script took around 10 seconds to run first time, and voila, here's the zip file in my Azure Storage container!

![The backup succeeded, yo!](//i.imgur.com/E0luBf5.png)

### Automating the script
To automate the script, we simply need to use Windows Task Scheduler. [You can read how to do that here.](//blogs.technet.com/b/heyscriptingguy/archive/2012/08/11/weekend-scripter-use-the-windows-task-scheduler-to-run-a-windows-powershell-script.aspx)

I set it to run once a day at a time when my users were likely either asleep or [watching Bond Marathons](//www.youtube.com/watch?v=aRrNlh-UaGg)... like 2am.

### Summary

ClearDB is probably the most sensible/easy/practical solution but it does have some drawbacks. I think once I saw the performance I could get from a dedicated Azure VM vs the ClearDB solution at a similar price point, I decided that was the way to go.

What would be ideal though is if Azure released it's own first party MySQL PaaS solution, similar to what they have with their own [SQL offering](//azure.microsoft.com/en-us/services/sql-database/).