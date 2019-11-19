const contractSource = `

payable contract Chat  =
  
    
  record user = 
    {
    owner: address,
    id : int,
    message : string,
    timestamp : int
    }
    
  record state = {
    chats : map(int, user),
    chatslength : int}
    
  entrypoint init() = { 
    chats = {},
    chatslength = 0}
  //returns lenght of chats 
  entrypoint chatLength() : int = 
    state.chatslength 
    
  entrypoint getUser(index : int) = 
    switch(Map.lookup(index, state.chats))
      None => abort("User doesnt exist")
      Some(x) => x  
    //Registers a Land
    
  payable stateful entrypoint message(message' : string) = 
    let timestamp = Chain.timestamp
    let newChat = {
      id = chatLength()+1,
      owner  = Call.caller,
      message = message',
      timestamp = timestamp}
    
    let index = chatLength() + 1
    put(state{chats[index] = newChat, chatslength = index})
    
  
    
  payable stateful entrypoint joinroom(index : int) = 
    Chain.spend(Contract.address, 1000000)  
  
    `;


const contractAddress = 'ct_2EnWDgB5HkhCAJoHMQBnnSdkKtohw5SVwEenNG5TD4vDL4trQf';
var gameChatArray = [];
var musicChatArray =[];
var client = null;
var chats = 0;



function renderGame() {
    
    var template = $('#template').html();

    Mustache.parse(template);
    var rendered = Mustache.render(template, {
        gameChatArray
    });




    $('#game').html(rendered);
    console.log("rendered")
}

function renderMusic() {
    
  var template = $('#templateMusic').html();

  Mustache.parse(template);
  var rendered = Mustache.render(template, {
      musicChatArray
  });




  $('#music').html(rendered);
  console.log("rendered")
}
// //Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
    //Create a new contract instance that we can interact with
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    
    const calledGet = await contract.call(func, args, {
        callStatic: true
    }).catch(e => console.error(e));
    
    const decodedGet = await calledGet.decode().catch(e => console.error(e));
  
    return decodedGet;
}

async function contractCall(func, args, value) {
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    //Make a call to write smart contract func, with aeon value input
    const calledSet = await contract.call(func, args, {
        amount: value
    }).catch(e => console.error(e));

    return calledSet;
}

window.addEventListener('load', async () => {
    $(".spinner").show();

    // $("#music").hide();
    // $("#game").hide();


    client = await Ae.Aepp()

    hackLength = await callStatic('chatLength', []);


    for (let i = 1; i <= hackLength; i++) {
        const chats = await callStatic('getUser', [i]);

        console.log("for loop reached", "pushing to array")

        gameChatArray.push({
            id : chats.id,
            message : chats.message,
            timestamp: new Date(chats.timestamp),
            owner :chats.owner



        })
    }
    $(".spinner").hide();
});




$('#gameGroup').click(async function () {
    console.log("Gaming clicked")
    $(".spinner").show();

    await contractCall('joinroom', [2], 1000)
    

    $("#music").hide();
    $("#game").show();

    renderGame();

    $(".spinner").hide();

    console.log("SUCCESSFUL")

});

// shows music group content

$('#musicGroup').click(async function () {
  console.log("Music clicked")
  $(".spinner").show();

  $("#game").hide();
  $("#music").show();


  await contractCall('joinroom', [3], 1000)


  renderMusic();

  $(".spinner").hide();

  console.log("Music room SUCCESSFUL")

});

// Send game group messages

$('#sendGame').click(async function () {
  console.log("sending game message")
  $(".spinner").show();

  var message  = ($('#usermessage').val())
  console.log(message)

  await contractCall('message', [message], 0)
  i = await callStatic('chatLength', [])
  newmsg = await callStatic('getUser', [i]);

  gameChatArray.push({
    message:message,
    owner : newmsg.owner,
    timestamp : Date(newmsg.timestamp)
  })
  console.log(newmsg.owner)
  console.log(newmsg.timestamp)


  renderGame();

  $(".spinner").hide();

  console.log("message sent ")

});

// Send music chat messages

$('#sendMusic').click(async function () {
  console.log("sending music message")
  $(".spinner").show();

  var message  = ($('#musicmessage').val())
  console.log(message)

  await contractCall('message', [message], 0)
  i = await callStatic('chatLength', [])
  newmsg = await callStatic('getUser', [i]);

  musicChatArray.push({
    message:message,
    owner : newmsg.owner,
    timestamp : Date(newmsg.timestamp)
  })
  console.log(newmsg.owner)
  console.log(newmsg.timestamp)


  renderMusic();

  $(".spinner").hide();

  console.log("message sent ")

  // document.getElementById("confirmation").innerHTML = " Reservation purchased Successfully"

  // $.colorbox({html:"<h1>Reservation booked successfully</h1>"});
});