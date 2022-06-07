'use strict';
let sp=null;
let arrMessagesChats=new Map();
let currList=null;
let currBtn=null;
let currUserList=null;
let socketClient = null;
let password=null;
let uid=null;
let email = null;
let sub=null;
let username=null;
let chtListGlob=null;
let userMasGlob=null;
let avatarColors = [
    '#2196F3', '#32c787',
    '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af',
    '#FF9800', '#39bbb0',
    '#97b1f3', '#f782e7',
    '#addfee', '#b967ff',
    '#ffdc73', '#eabec8',
];
const formsWrapper=document.querySelector('.chat-forms-wrapper');
const usernamePage = document.querySelector('#username-page');
const usernamePageContainer = document.querySelector('.username-page-container');
const auText=document.querySelector('#authenticationText');
const chatPage = document.querySelector('.chat-page');
const usernameForm = document.querySelector('#usernameForm');
const registerForm = document.querySelector('#registerForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const autoEmail = document.querySelector('#email');
const autoPassword = document.querySelector('#password');
const regNickname = document.querySelector('#regNickname');
const regEmail = document.querySelector('#regEmail');
const regPassword = document.querySelector('#regPassword');
const btnSmile=document.getElementById('btn-smile');

const getBtnMsg=document.getElementById('get-btn-msg');
let sm=null;
let chatJoinForm=document.getElementById('ChatJoinForm');
let chatCreateForm=document.getElementById('ChatCreateForm');

const chatHeader=document.querySelector('#header-chat-name');
const chatListBtnContainer=document.querySelector('.chat-btn-list');
const chatContainer=document.querySelector('.chat-container');
const formMsg=document.getElementById("messageForm");


let autoJoinBtn=document.getElementById('AJoin');
let regJoinBtn=document.getElementById('regJoin');
let chatJoinName=document.getElementById('cJname');
let chatJoinPassword=document.getElementById('cJpassword');
let chatJoinBtn=document.getElementById('cJJoin');

let chatRegName=document.getElementById('cChtName');
let chatRegPassword=document.getElementById('cChtpassword1');
let chatRegRepeatPassword=document.getElementById('cChtpassword2');
let chatCreateJoinBtn=document.getElementById('cChtJoin');

const chtUl='-cht';
const chtBtn='-btn';
const chtUserList='-chat-user-list';
const chtUser='-user';

const MessageType= new Map();
MessageType.set('CHAT',outputChatMessage);
MessageType.set('FILE',outputFileMessage);
MessageType.set('AUTO',outputAutoMessage);
MessageType.set('JOINCHAT',outputJOINCHATMessage);

autoEmail.oninput=validateAutoData;
autoPassword.oninput=validateAutoData;

regEmail.oninput=validateRegData;
regPassword.oninput=validateRegData;
regNickname.oninput=validateRegData;

chatJoinName.oninput=validateJoinChatData;
chatJoinPassword.oninput=validateJoinChatData;

chatRegName.oninput=validateRegChatData;
chatRegPassword.oninput=validateRegChatData;
chatRegRepeatPassword.oninput=validateRegChatData;
getBtnMsg.onclick=getNewMessages;
checkConnection();
function checkConnection()
{   email=sessionStorage.getItem('email');
    if (email===null) {
        formsWrapper.classList.remove('hidden');
        return;
    }

    password=sessionStorage.getItem('password');
    let socket = new SockJS('/ws');
    socketClient = Stomp.over(socket);
    socketClient.connect({}, onCheckAutoData);
}

function generateInformation(message,btnContent='Exit')
{
    let elementInform=document.createElement('div');
    elementInform.classList.add('informCl');
    let infoText=document.createElement('p');
    infoText.textContent=message;
    elementInform.appendChild(infoText);
    let btnExitForm=document.createElement('button');
    btnExitForm.classList.add('accent');
    btnExitForm.textContent=btnContent;
    btnExitForm.onclick=()=>elementInform.remove();
    elementInform.appendChild(btnExitForm);
    return elementInform;
}
function regForm()
{
    usernameForm.classList.add('hidden');
    auText.textContent='Register';
    registerForm.classList.remove('hidden');
    autoPassword.value='';
    autoEmail.value='';
}
function autoForm()
{   registerForm.classList.add('hidden');
    auText.textContent='Log in';
    usernameForm.classList.remove('hidden');
    regPassword.value='';
    regEmail.value='';
    regNickname.value='';
}
function onAfterCheckedData(event)
{
    let res=JSON.parse(event.body);
    sub.unsubscribe();
    socketClient.disconnect();
    if (res.str==="Good")
    {
        username=res.nameu;
        usernamePageContainer.classList.add('hidden');
        formsWrapper.classList.add('hidden');
        chatPage.classList.remove('hidden');
        sessionStorage.setItem('email',email);
        sessionStorage.setItem('password',password);
        let socket = new SockJS('/ws');
        socketClient = Stomp.over(socket);
        chtListGlob=res.chatlist;
        userMasGlob=res.usermas;
        uid=res.userid;
        socketClient.connect({}, cConnected);
    }
    else
    {
        usernamePage.appendChild(generateInformation(res.str));
    }

}
function onCheckAutoData(){

    sub=socketClient.subscribe('/chat/responseUserData', onAfterCheckedData);
    socketClient.send("/app/chat.requestUserData",
        {},
        JSON.stringify({uemail:email,upassword:password, unickname:""}));
}
function onCheckRegData()
{
    sub=socketClient.subscribe('/chat/responseUserData', onAfterCheckedData);
    socketClient.send("/app/chat.requestUserRegData",
        {},
        JSON.stringify({uemail:email,upassword:password, unickname:username}));
}
function regConnect(event)
{
    email = regEmail.value.trim();
    password = regPassword.value.trim();
    username=regNickname.value.trim();
    let socket = new SockJS('/ws');
    socketClient = Stomp.over(socket);
    socketClient.connect({}, onCheckRegData);
    event.preventDefault();
}
function connect() {
        email = autoEmail.value.trim();
        password = autoPassword.value.trim();
        let socket = new SockJS('/ws');
        socketClient = Stomp.over(socket);
        socketClient.connect({}, onCheckAutoData);
}


function checkGetMsgBtn()
{

    if (arrMessagesChats.get(currList.id)>0)
        getBtnMsg.classList.remove('hidden');
    else
        getBtnMsg.classList.add('hidden');
}
function clickBtnChat()
{
    this.checked=true;
    let findVal=this.id.substring(0,this.id.length-chtBtn.length);
   let ulList=document.getElementById(findVal+chtUl);
    chatHeader.textContent=this.value+' ';
    currList.classList.add('hidden');
    ulList.classList.remove('hidden');
    currUserList.classList.add('hidden');
    currUserList=document.getElementById(findVal+chtUserList);
    currUserList.classList.remove('hidden');
    currBtn=this;
    currList=ulList;
    checkGetMsgBtn();

}
function generateChatContent(chtName)
{
    let ulContainer=document.createElement('ul');
    ulContainer.classList.add('messageArea');
    ulContainer.id=chtName+chtUl;
    ulContainer.classList.add('hidden');
    chatContainer.insertBefore(ulContainer,formMsg);
    return ulContainer;


}
function generateChatBtn(chtName)
{   let radioBtnWrapper=document.createElement('div');
    radioBtnWrapper.classList.add('radio-btn-wrapper');
    let inputBtnChat=document.createElement('input');
    inputBtnChat.type='radio';
    inputBtnChat.name='btn-chat-group';
    inputBtnChat.value=chtName;
    inputBtnChat.classList.add('sliding-button');
    inputBtnChat.id=chtName+chtBtn;
    let labelBtn=document.createElement('label');
    labelBtn.setAttribute('for',inputBtnChat.id);
    labelBtn.classList.add('label-sliding');
    labelBtn.textContent=chtName;
    inputBtnChat.onclick=clickBtnChat;
    radioBtnWrapper.appendChild(inputBtnChat);
    radioBtnWrapper.appendChild(labelBtn);
    chatListBtnContainer.appendChild(radioBtnWrapper);
    return inputBtnChat;
}
function generateChatUserElement(uName)
{   let userWrapper=document.createElement('div');
    userWrapper.classList.add('user-wrapper');
    let userNameIEl=document.createElement('i');
    userNameIEl.classList.add('user-avatar');
    userNameIEl.classList.add(uName+chtUser);
    userNameIEl.style['background-color']=getAvatarColor(uName);
    let avatarText = document.createTextNode(uName[0]);
    userNameIEl.appendChild(avatarText);
    userWrapper.setAttribute('data-tooltip',uName);
    userNameIEl.onclick=userChat;
    userWrapper.appendChild(userNameIEl);
    return userWrapper;
}
function generateChatUserList(uList,chtName)
{  let UListDivEl=document.createElement('div');
    UListDivEl.classList.add('chat-user-list');
    UListDivEl.id=chtName+chtUserList;
    UListDivEl.classList.add('hidden');
   let userListMas=uList.split(',');
   for (let i=0; i<userListMas.length;i++)
   {
       UListDivEl.appendChild(generateChatUserElement(userListMas[i]));
   }
    chatPage.appendChild(UListDivEl);
   return UListDivEl;
}
function receivePrivateChat(result) {
    sp.unsubscribe();
    result=JSON.parse(result.body);
    if (result.str==="good") {
        let nameChat=result.chatname;
        if (result.state==="click") {
            let btnExist=document.getElementById(nameChat+chtBtn);
            btnExist.dispatchEvent(new Event('click'));

        }
        else {
            socketClient.subscribe('/chat/messaging/' + result.chatname + chtUl, onMessageReceived);
            currBtn.blur();
            currList.classList.add('hidden');
            currUserList.classList.add('hidden');

            currBtn=generateChatBtn(nameChat);
            currBtn.value=result.chatreal;
            chatHeader.textContent=currBtn.value+' ';
            currBtn.parentElement.setAttribute('data-tooltip',currBtn.value);
            currBtn.nextElementSibling.textContent=currBtn.value[0];
            currList=generateChatContent(nameChat);
            currUserList=generateChatUserList(result.userlist,nameChat);
            currList.classList.remove('hidden');
            currUserList.classList.remove('hidden');
            currBtn.checked=true;
            getBtnMsg.classList.add('hidden');
        }
    }

}
function userChat()

{
    let classesChat=this.className;
    classesChat=classesChat.substring(12,classesChat.length-chtUser.length);

    let newChtName=username+'_'+classesChat;
    let indexOfEl=-1;
    this.parentNode.parentNode.childNodes.forEach((item,index)=>
    {
        if (item===this.parentNode)
            indexOfEl=index;
    })
    sp=socketClient.subscribe('/chat/checkPrivateChat', receivePrivateChat);
    socketClient.send("/app/chat.addPrivate",
        {},
        JSON.stringify({name: newChtName+','+currList.id+','+indexOfEl, password: "", nickname: newChtName, userid:uid})
    );

}
function connectAllChats(strChat,userMas)
{
   let strChatMas=strChat.split(',');
   let i=0;
        for (let chtName in strChatMas) {
           currBtn=generateChatBtn(strChatMas[chtName]);
           if (strChatMas[chtName].includes("_"))
           {
               let arrNames=strChatMas[chtName].split("_");
               currBtn.value=(arrNames[0]===username)?arrNames[1]:arrNames[0];
           }
           currBtn.nextElementSibling.textContent=currBtn.value[0];
            currBtn.parentElement.setAttribute('data-tooltip',currBtn.value);
            currList=generateChatContent(strChatMas[chtName]);
            currUserList=generateChatUserList(userMas[i],strChatMas[chtName]);
            socketClient.subscribe('/chat/messaging/' + strChatMas[chtName] + chtUl, onMessageReceived);
            ++i;
        }
        currBtn.checked=true;
        currList.classList.remove('hidden');
    chatHeader.textContent=currBtn.value+' ';
    currUserList.classList.remove('hidden');
    checkGetMsgBtn();
}
function cConnected()
{  // sub.unsubscribe();
    socketClient.subscribe('/chat/messaging/'+uid,onSaveMessages);
    connectAllChats(chtListGlob,userMasGlob);
    socketClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN', uid:uid})
    )

    connectingElement.classList.add('hidden');
    socketClient.send("/app/chat.getSmiles");
    sm=socketClient.subscribe('/chat/responseSmiles',createSmileContent);

}

function joinChat()
{
    formsWrapper.classList.remove('hidden');
    formsWrapper.style.opacity='1';
    formsWrapper.style.backgroundColor='rgba(67, 70, 75, 0.8)';
    chatJoinForm.classList.remove('hidden');

    chatPage.classList.add('disable');

}
function onExitJoin()
{  formsWrapper.classList.add('hidden');
    formsWrapper.style.opacity='0';
    chatJoinForm.classList.add('hidden');
    chatPage.classList.remove('disable');
}
function createChat()
{   formsWrapper.classList.remove('hidden');
    formsWrapper.style.opacity='1';
    formsWrapper.style.backgroundColor='rgba(67, 70, 75, 0.8)';
    chatCreateForm.classList.remove('hidden');
    chatPage.classList.add('disable');
}
function onExitCreate() {
    formsWrapper.classList.add('hidden');
    formsWrapper.style.opacity='0';
    chatCreateForm.classList.add('hidden');
    chatPage.classList.remove('disable');
}
function onAfterCheckedChat(event)
{    sub.unsubscribe();
    let res=JSON.parse(event.body);
    if (res.str==="Good")
    {    socketClient.subscribe('/chat/messaging/' + res.chatname + chtUl, onMessageReceived);
       let btnNewChat= generateChatBtn(res.chatname);
        btnNewChat.nextElementSibling.textContent=btnNewChat.value[0];
        btnNewChat.parentElement.setAttribute('data-tooltip',btnNewChat.value);
        generateChatContent(res.chatname);
        generateChatUserList(res.userlist,res.chatname);
        btnNewChat.dispatchEvent(new Event('click'));
        onExitCreate();
        getBtnMsg.classList.add('hidden');

    }
    else
    {
        usernamePage.appendChild(generateInformation(res.str));
    }
}
function createSmileContent(content)
{   sm.unsubscribe();
    content=JSON.parse(content.body)
    let ulSmile=document.createElement('ul');
    ulSmile.classList.add('ulSmile');
    ulSmile.onmouseover=()=>{
        ulSmile.classList.remove('hidden');
    }
    ulSmile.onmouseout=()=>{
        ulSmile.classList.add('hidden');
    }
    btnSmile.onmouseover=()=>{
        ulSmile.classList.remove('hidden');
    }
    btnSmile.onmouseout=()=>{
        ulSmile.classList.add('hidden');
    }
    for (let smile in content)
    {
        let liSmile=document.createElement('li');
        let imgSmile=document.createElement('img');
        imgSmile.src=content[smile];
        liSmile.appendChild(imgSmile);
        liSmile.onclick=sendSmile;

        ulSmile.appendChild(liSmile);

    }
    ulSmile.classList.add('hidden');
    chatContainer.appendChild(ulSmile);

}
function onAfterJoinedChat(event)
{   sub.unsubscribe();
    let res=JSON.parse(event.body);

    if (res.str==="Good")
    {     socketClient.subscribe('/chat/messaging/' + res.chatname + chtUl, onMessageReceived);
        let btnNewChat= generateChatBtn(res.chatname);
        btnNewChat.nextElementSibling.textContent=btnNewChat.value[0];
        btnNewChat.parentElement.setAttribute('data-tooltip',btnNewChat.value);
        generateChatContent(res.chatname);
        generateChatUserList(res.userlist,res.chatname);
        btnNewChat.dispatchEvent(new Event('click'));
        onExitJoin();
        checkGetMsgBtn();

    }
    else
    {
        usernamePage.appendChild(generateInformation(res.str));
    }
}
function onJoinBtnForm()
{   sub=socketClient.subscribe('/chat/responseChat', onAfterJoinedChat);
    socketClient.send("/app/chat.joinChat",
        {},
        JSON.stringify({name: document.getElementById('cJname').value, password: document.getElementById('cJpassword').value, nickname:username, userid:uid})
    )
}
function onCreateBtnForm()
{   sub=socketClient.subscribe('/chat/responseRegChat', onAfterCheckedChat);
    socketClient.send("/app/chat.createChat",
        {},
        JSON.stringify({name: document.getElementById('cChtName').value, password: document.getElementById('cChtpassword1').value, nickname:username, userid:uid})
    )
}
function sendMessage(event) {

    let messageContent = messageInput.value.trim();

    if(messageContent && socketClient) {
        let chatMessage = {
            sender: username,
            content: messageInput.value,
            timestamp: getMessageTime(),
            type: 'CHAT',
            addresschat:currList.id,
        };

        socketClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}
function sendSmile()
{
    let imgEl=this.firstElementChild;
    let chatMessage = {
        sender: username,
        content: imgEl.src,
        timestamp: getMessageTime(),
        type: 'FILE',
        addresschat:currList.id,
    };
    socketClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
}

function sendFile(fileInput) {

    let reader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);

    reader.onload = function () {

        let chatMessage = {
            sender: username,
            content: reader.result,
            timestamp: getMessageTime(),
            type: 'FILE',
            addresschat:currList.id,
        };


        socketClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    };
     currBtn.focus();

 }
 function outputAutoMessage(message,state) {
     let content = JSON.parse(message.content);
     let userClickUid=Number(message.uid);
     let  myUID=Number(uid);
     if (userClickUid === myUID) {

     socketClient.subscribe('/chat/messaging/' + content.chatname + chtUl, onMessageReceived);
     let btn = generateChatBtn(content.chatname);
     btn.value = content.chatreal;
     btn.nextElementSibling.textContent = btn.value[0];
     btn.parentElement.setAttribute('data-tooltip', btn.value);
     generateChatContent(content.chatname);
     generateChatUserList(content.userlist, content.chatname);
 }

 }
 function outputJOINCHATMessage(message,state)
 {
     let content = JSON.parse(message.content);
     let userClickUid=Number(message.uid);
     let  myUID=Number(uid);
     if (userClickUid === myUID)
         return;
    let element=document.getElementById(content.chatname+chtUserList);
    element.appendChild(generateChatUserElement(content.user));
 }
function msgType(message,state)
{
    MessageType.get(message.type)(message,state);
}
function onSaveMessages(payload)
{
    let res=JSON.parse(payload.body);
    if (res==="")
        return;
    arrMessagesChats.set(res[0].chtname,res[0].messageid);
    checkGetMsgBtn();
    for (let i=res.length-1; i>=1; i--)
        msgType(res[i],0);

}

function onMessageReceived(payload) {

    let message = JSON.parse(payload.body);
    msgType(message);
}



function outputChatMessage(message,state) {
    let messageArea=document.getElementById(message.addresschat);
    if (messageArea!==null) {
        let messageElement = document.createElement('li');
        messageElement.classList.add('chat-message');

        // вывод аватарки пользователя
        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);

        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);

        let textElement = document.createElement('p');
        let messageText = document.createTextNode(message.content);
        textElement.classList.add('text-info');
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        let messageTimestamp = document.createElement('p');
        messageTimestamp.classList.add('time');
        let dateText = document.createTextNode(message.timestamp);
        messageTimestamp.appendChild(dateText);

        messageElement.appendChild(messageTimestamp);
        if (state===0)
            messageArea.prepend(messageElement);
        else
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
}

function outputFileMessage(message,state) {
    let messageArea=document.getElementById(message.addresschat);
    if (messageArea!==null)
    {
        let messageElement = document.createElement('li');
        messageElement.classList.add('chat-message');

        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        // вывод имени пользователя
        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);

        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);


        let image = document.createElement('img');
        image.classList.add('send-img');
        image.src = message.content;
        let imageWrapper = document.createElement('div');
        imageWrapper.appendChild(image);
        messageElement.appendChild(imageWrapper);


        let messageTimestamp = document.createElement('p');
        messageTimestamp.classList.add('time');
        let dateText = document.createTextNode(message.timestamp);
        messageTimestamp.appendChild(dateText);

        messageElement.appendChild(messageTimestamp);
        if (state===0)
            messageArea.prepend(messageElement);
        else
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
}


function getAvatarColor(messageSender) {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    let index = Math.abs(hash % avatarColors.length);
    return avatarColors[index];
}


function getMessageTime() {
    let now = new Date();
    return  now.toLocaleString("ru");
}
function defineBoxShadowColor(elementResult,element)
{
    if (element.value==='')
    {
        element.classList.remove('error');
        element.classList.remove('good');
        return;
    }
    if (elementResult) {
        element.classList.remove('error');
        element.classList.add('good');
        return;
    }
        element.classList.remove('good');
        element.classList.add('error');
}
function validateAutoData()
{
    let emailResult=validateEmail(autoEmail.value);
    let passwordResult=validatePassword(autoPassword.value);
    defineBoxShadowColor(emailResult,autoEmail);
    defineBoxShadowColor(passwordResult,autoPassword);
    autoJoinBtn.disabled=Boolean(!(emailResult && passwordResult));

}
function validateRegData()
{   let nickNameResult=validateName(regNickname.value);
    let emailResult=validateEmail(regEmail.value);
    let passwordResult=validatePassword(regPassword.value);
   defineBoxShadowColor(nickNameResult,regNickname);
   defineBoxShadowColor(emailResult,regEmail);
    defineBoxShadowColor(passwordResult,regPassword);
    regJoinBtn.disabled=Boolean(!(emailResult && passwordResult && nickNameResult));

}
function validateJoinChatData()
{
    let nameResult=validateName(chatJoinName.value);
    let passwordResult=validatePassword(chatJoinPassword.value);
    defineBoxShadowColor(nameResult,chatJoinName);
    defineBoxShadowColor(passwordResult,chatJoinPassword);
    chatJoinBtn.disabled=Boolean(!( nameResult && passwordResult));

}
function validateRegChatData()
{
    let nameResult=validateName(chatRegName.value);
    let passwordResult=validatePassword(chatRegPassword.value);
    let password2Result=validatePassword(chatRegRepeatPassword.value);
    let equalResult=equalPasswords(password2Result,passwordResult);
    defineBoxShadowColor(nameResult,chatRegName);
    defineBoxShadowColor(passwordResult,chatRegPassword);
    defineBoxShadowColor(password2Result,chatRegRepeatPassword);
    defineBoxShadowColor(equalResult,chatRegRepeatPassword);


    chatCreateJoinBtn.disabled=Boolean(!( nameResult && passwordResult && password2Result && equalResult));

}
function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email));
}
function validateName(login){
    let re = /^[a-zA-Z\dА-яеЁ][a-zA-Z\dА-яеЁ]{5,15}$/;
    return re.test(String(login));
}
function validatePassword(password){
    let re = /[a-zA-Z\d]{5,30}$/;
    return re.test(String(password));
}
function equalPasswords(password_0, password_1){
    return (String(password_0) === String(password_1));
}

function getNewMessages()
{   let valueMsg=arrMessagesChats.get(currList.id);
    if (valueMsg>0)
    {
        let chatMessage = {

            uid:uid,
            messageid:valueMsg,
            chtname:currList.id
        };
        socketClient.send("/app/chat.getMessagesForChat",
            {},
            JSON.stringify(chatMessage));
    }
}
messageForm.addEventListener('submit', sendMessage, true);




