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


const contractAddress = 'ct_2XYCYJ92H56pLL1Asucd4JcNSUHBoaBjjrmX7CJrMh1hSNDiPC';
var chatArray = [];
var client = null;
var chats = 0;



function renderProduct() {
    
    var template = $('#template').html();

    Mustache.parse(template);
    var rendered = Mustache.render(template, {
        chatArray
    });




    $('#general').html(rendered);
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

    client = await Ae.Aepp()

    hackLength = await callStatic('chatLength', []);


    for (let i = 1; i <= hackLength; i++) {
        const chats = await callStatic('getUser', [i]);

        console.log("for loop reached", "pushing to array")

        chatArray.push({
            id : chats.id,
            message : chats.message,
            timestamp: new Date(chats.timestamp),
            owner :chats.owner



        })
    }
    $(".spinner").hide();
});




$('#gaming').click(async function () {
    $(".spinner").show();

    await contractCall('joinroom', [2], 1000000)


    renderProduct();

    $(".spinner").hide();

    console.log("SUCCESSFUL")

    // document.getElementById("confirmation").innerHTML = " Reservation purchased Successfully"

    // $.colorbox({html:"<h1>Reservation booked successfully</h1>"});
});