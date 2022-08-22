# snhswebsite


View the live website at https://snhswebsite.herokuapp.com or http://cypressbaysnhs.com (assuming the domain is still active)

# For the Cypress Bay SNHS webmasters of the future:

Hello! I'm Justin Liu, the webmaster of the 2021-2022 school year and the original creator of the website. First, congratulations on your new position and good luck with the responsibility that comes with it: maintaining the website to be the best club website in the school!

Even if you don't know how to code or only have minimal programming knowledge, you can still carry out your responsibility as club webmaster, as I've designed an easy-to-use admin panel for managing the website. However, if you want to go above and beyond and add new features or pages, it's best that you have experience working with multiple programming languages and tools or are willing to learn.

No matter which kind of webmaster you are, below is my guide on getting started.

## Videos

~~I made some YouTube videos on everything you might need to know, but below is the text version.~~ (**TBA**... maybe)

## Quickstart

The first thing you need to do is find the document with important secret credentials that you'll need as webmaster to access the website. You will find it if you go to the shared folder in the Google Drive of the club's gmail, cypressbaysnhs@gmail.com or the gmail cbhssnhswebmaster@gmail.com. There, you'll find a document I shared titled *WEBMASTER CREDENTIALS*. You may need to use the search bar to find it. As webmaster, you'll be responsible for managing the website through three different platforms: cypressbaysnhs.com, Heroku, and NameCheap. Advanced webmasters who want to contribute to the code behind the website will fourthly manage the website through Github.

## cypressbaysnhs.com admin panel

If technical issues never happen and you're only doing the basic duty of uploading announcements, this should be all you'll need. You'll use the credentials to log into the website itself in order to access the admin panel. To get there, after logging into the administrator account, click on my name, "JUSTIN LIU", on the right side of the navigation bar. A dropdown will appear. Click "Admin Panel". Here, you can change site settings like enabling/disabling the sign-up form and updating the links. In the announcements tab, you can manage announcements to keep members updated on upcoming events and important notices.
![The admin panel is in the dropdown under the name](/assets/readme/adminPanel.png)

## Heroku (for fixing technical difficulties)

This is the platform that hosts the website so that anyone can access it. If the website somehow goes down, you can use Heroku to restart it. If you're an advanced webmaster who is contributing to the code, Heroku automatically detects when you push to the main branch and will restart the website with your new code. When you log in and go to the snhswebsite dashboard, you can go to the Resources tab.
![Heroku resources tab](/assets/readme/HerokuResources.png)

Here is where you'll restart the program running the website if it goes down. To do so, click the edit button that my cursor is hovering over in the image, toggle off the slider to turn off the program, then confirm. Then click the same edit button again, toggle on the slider to turn on the program, then confirm. It may take a minute or so to boot up. You can check the progress in Heroku logs.
![Heroku logs](/assets/readme/HerokuLogs.png)

Additionally, you can also use Heroku to go back to a previous version of the website if some breaking changes were done to the code. To do this, go to the Overview tab and press "All Activity" as shown in the image below.
![Heroku All Activity button](/assets/readme/HerokuRollback1.png)

You can scroll through previous versions of the program and use the "Roll back to here" button. If you need to roll back to the last version that I pushed, you can look for a build with my email next to it: 88jliu88@gmail.com
![Heroku Roll back to here button](/assets/readme/HerokuRollback2.png)

## Namecheap (renewing the domain)

Namecheap is the domain-hosting service that allows users to use the cypressbaysnhs.com domain to access the website. This does, however, come with an annual fee. You shouldn't be using this very often, only when you need to renew the payment for the domain. The domain can be paid for multiple years at a time and can also be set to auto-renew. In my year, using the club funds to pay for something was very complicated, requiring invoices and such. An option is to pay for the domain using your own credit card and have the club reimburse you with a check, which is how I paid for the domain.

## Github (for advanced webmasters)

Advanced webmasters with coding knowledge can contribute to the code in this repository. The account from the *WEBMASTER CREDENTIALS* document has been added as a collaborator that can push to the repository. You'll need to use Github to change the code if you want to change the content of webpages (besides what you can change through the admin panel) or add/change features. It's also fine if you only change some HTML to edit page text. You can find the HTML files in the templates folder. If you're only editing HTML and you're familiar enough with it that you don't need to test your code because you won't make mistakes, then you can just edit files directly on Github without going through this setup process and confirm your changes there. Otherwise, to test the code on your own computer, I recommend setting it up.

Here are some technical details about the code base to indicate what you'll need to know or read up on to contribute to the repository. It uses the FastAPI Python micro-framework for the backend (which also comes with the Jinja2 templating engine), the fastapi-users library to manage users, and webpack for the frontend. In addition to Python for the backend, you'll want to know the frontend languages of JavaScript, HTML, and CSS. I used something called SCSS, which adds a lot of super helpful features to CSS, but it's compatible with plain CSS.

A note about conventions: If you want to know what convention I used for the commit messages, check out [Conventional Commits](https://www.conventionalcommits.org/). An attempt was also made to loosely follow the [Block Element Modifier (BEM)](http://getbem.com/) convention for CSS classes.

To set up the code on your computer, assuming you have Github downloaded, Python installed, npm installed, a good multi-language IDE (Visual Studio Code is great, though I've been using PyCharm Professional, which students can get for free), and solid programming knowledge, clone the repository in your CLI with the following commands.
```
git clone https://github.com/Asinphi/snhswebsite.git
cd snhswebsite
git remote add origin https://github.com/Asinphi/snhswebsite.git
```
In your IDE, you should see the files from the Github repo now on your computer. Install the dependencies using the following commands.
```
pip install -r requirements.txt
npm install
```
Lastly, you'll need to create a file named ".env" (without the quotation marks) in the root folder. This file is necessary for the program but contains sensitive information, so it is not in the public Github repo. To get the data to input into the .env file, log into Heroku and in the snhswebsite dashboard, go to the Settings tab and then Reveal Config Vars. Put the following text into your .env folder:
```dotenv
NODE_ENV=development
DATABASE_URL=GET THIS FROM HEROKU
TOKEN=GET THIS FROM HEROKU
```
And remember to make sure NODE_ENV is development, not production (even though it says production on Heroku). To run the code, if you're using Visual Studio Code or PyCharm, the run configurations may already be set up. Otherwise, you can run the code with the terminal command:
```
python -m uvicorn main:app --port 8000 --host 127.0.0.1
```
This will only run the backend. Since the frontend files use webpack, no changes will be made to the frontend unless you run this command:
```
npm run watch
```
This will detect all changes you make to the frontend files and recompile them. This is the first command I run whenever I start working on this project. When the program is running, you'll be able to see the website on your local computer at http://127.0.0.1:8000.

If you changed some code and it works when tested and you want to push those changes to the repository, then I recommend you use your IDE's Github commit tools for more control over your individual commits. However, you can also commit and push all your changes at once using the following commands:
```
git add .
git commit -m "message about what I did"
git push origin main
```
After pushing, Heroku will automatically detect it and deploy your changes to the public website at cypressbaysnhs.com.

For any problems, you can open an issue in this repository's Issues tab.
