document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.addEventListener("submit", (event) => {
    event.preventDefault()
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body= document.querySelector('#compose-body').value;

    PostMails(recipients, subject, body)
    .then(result => {
        // Print result
        console.log(result);
        if (result.message == "Email sent successfully.") {
          load_mailbox('sent');
        }
    });    
  })
  
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  FetchMails(mailbox)
    .then(emails => {
      // Print emails
      console.log(emails);
      listEmail(emails, mailbox);
      // ... do something else with emails ...
  });
}

// async functions for fetching

async function FetchMails(mailbox) {
  const response = await fetch(`/emails/${mailbox}`);
  const emails = await response.json();
  return emails;
}


async function PostMails(recipients, subject, body) {
  const sent = await fetch('/emails', {
                            method: 'POST',
                            body: JSON.stringify({
                                recipients: `${recipients}`,
                                subject: `${subject}`,
                                body: `${body}`
                            })
                          });
  const result = await sent.json();
  return result;                            
}

async function readEmail(id) {
  const email = await fetch(`/emails/${id}`) ;
  const datos = await email.json();
  const read = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })      
  return datos;
}

async function archive(id) {
  const archive = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })     
}

async function unarchive(id) {
  const archive = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })  
}

// functions for views

function listEmail(emails, mailbox) {
  emails.forEach(email => {

    const element = document.createElement('div');
    element.className = "email";

    if (email.read == false) {
      element.style.backgroundColor = "#FFF";
    }
    else {
      element.style.backgroundColor = "#C7C8CC";
    }

    const sender = document.createElement('h5')
    sender.innerHTML = email.sender;
    element.appendChild(sender);

    const subject = document.createElement('p')
    subject.innerHTML = email.subject;
    element.appendChild(subject);

    const timestamp = document.createElement('p')
    timestamp.innerHTML = email.timestamp;
    element.appendChild(timestamp);

    if (mailbox == "inbox") {
      const archived =  document.createElement('input')
      archived.className = "unarchived";
      archived.value = "archive";
      archived.type = "button"
      element.appendChild(archived);
      archived.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault;
        archive(email.id)
        .then(() => {
          load_mailbox('inbox');
        })
      })
    }
    else if (mailbox == "archive") {
      const archived =  document.createElement('input');
      archived.className = "archived";
      archived.value = "unarchive";
      archived.type = "button"
      element.appendChild(archived);
      archived.addEventListener('click', function(event) {
        event.stopPropagation();
        unarchive(email.id)
        .then(() => {
          load_mailbox('inbox');
        })
      })
    }

      element.addEventListener('click', function() {
      readEmail(email.id) 
       .then(email => {
        console.log(email);
        viewEmail(email, mailbox);
       })
    });
    
    document.querySelector('#emails-view').append(element);  
    
  } 
  ) 
}

function viewEmail(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block'

  const sender =  document.querySelector('#sender');
  const recipients =  document.querySelector('#recipients');
  const subject =  document.querySelector('#subject');
  const timestamp = document.querySelector('#time');
  const body =  document.querySelector('#body');
  const answer = document.querySelector('#answer');

  sender.innerHTML = id.sender;
  recipients.innerHTML = id.recipients;
  subject.innerHTML = id.subject;
  timestamp.innerHTML = id.timestamp;
  body.innerHTML = id.body;

  if (mailbox != "sent"){
    answer.addEventListener("click", () => {
      compose_email('compose')
      answerEmail(id)
    })
  }
  else {
    answer.style.display = "none"
  }
}

function answerEmail(id) {
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body= document.querySelector('#compose-body');

  recipients.value = id.sender
  if (id.subject.slice(0, 3) != "Re:") {
    subject.value = `Re: ${id.subject}`
  }
  else {
    subject.value = id.subject
  }
  body.value = `\nOn ${id.timestamp} ${id.sender} wrote: ${id.body}`
}
