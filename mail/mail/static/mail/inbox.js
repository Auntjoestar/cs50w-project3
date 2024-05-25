document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox', true));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent', true));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive', true));
  document.querySelector('#compose').addEventListener('click', () => compose_email(true));

  // By default, load the inbox
  load_mailbox('inbox', false);

  // Handle back/forward navigation
  window.onpopstate = function(event) {
    if (event.state) {
      if (event.state.view === 'compose') {
        compose_email(false);
      } else if (event.state.view === 'read') {
        viewEmail(event.state.email, event.state.mailbox, false);
      } else {
        load_mailbox(event.state.mailbox, false);
      }
    }
  };
});

function compose_email(pushState = false) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';
  const alert = document.querySelector(".alert")

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  alert.style.display = 'none';
  if (pushState) {
    history.pushState({ view: 'compose' }, '', '#compose');
  }

  // Attach submit event handler (make sure it's not added multiple times)
  const form = document.querySelector('#compose-form');
  form.onsubmit = (event) => {
    event.preventDefault();
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    PostMails(recipients, subject, body)
      .then(result => {
        console.log(result);
        if (result.message == "Email sent successfully.") {
          load_mailbox('sent', true);
        }
        else {
          alert.innerHTML = ''
          alert.style.display = 'block';
          const message = document.createElement('strong')
          message.innerHTML = result.error;
          alert.appendChild(message)
        }
      });
  };
}


function load_mailbox(mailbox, pushState = false) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  FetchMails(mailbox)
    .then(emails => {
      console.log(emails);
      listEmail(emails, mailbox);
    });

  if (pushState) {
    history.pushState({ view: 'mailbox', mailbox: mailbox }, '', `#${mailbox}`);
  }
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
  });
  // After archiving, reload the inbox and update history state
  load_mailbox('inbox', true);
}


async function unarchive(id) {
  const archive = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });
  // After unarchiving, reload the inbox and update history state
  load_mailbox('inbox', true);
}


// functions for views

function listEmail(emails, mailbox) {
  emails.forEach(email => {
    const element = document.createElement('div');
    const about = document.createElement('div');
    const info = document.createElement('div');

    element.appendChild(about);
    element.appendChild(info);
    element.className = "email";
    info.className = "info";
    about.className = "about";
    element.style.backgroundColor = email.read ? "#C7C8CC" : "#FFF";

    const sender = document.createElement('h5');
    sender.innerHTML = email.sender;
    about.appendChild(sender);

    const subject = document.createElement('p');
    subject.innerHTML = email.subject;
    about.appendChild(subject);

    const timestamp = document.createElement('p');
    timestamp.innerHTML = email.timestamp;
    info.appendChild(timestamp);

    if (mailbox === "inbox") {
      const archived = document.createElement('input');
      archived.className = "btn btn-primary";
      archived.value = "archive";
      archived.type = "button";
      info.appendChild(archived);
      archived.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        archive(email.id)
          .then(() => {
            load_mailbox('inbox', true);
          });
      });
    } else if (mailbox === "archive") {
      const unarchiveButton = document.createElement('input');
      unarchiveButton.className = "btn btn-secondary";
      unarchiveButton.value = "unarchive";
      unarchiveButton.type = "button";
      info.appendChild(unarchiveButton);
      unarchiveButton.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        unarchive(email.id)
          .then(() => {
            load_mailbox('inbox', true);
          });
      });
    }

    element.addEventListener('click', function() {
      readEmail(email.id)
        .then(email => {
          console.log(email);
          viewEmail(email, mailbox, true);
        });
    });

    document.querySelector('#emails-view').append(element);
  });
}


function viewEmail(email, mailbox, pushState = false) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';

  const sender = document.querySelector('#sender');
  const recipients = document.querySelector('#recipients');
  const subject = document.querySelector('#subject');
  const timestamp = document.querySelector('#time');
  const body = document.querySelector('#body');
  const answer = document.querySelector('#answer');

  sender.innerHTML = email.sender;
  recipients.innerHTML = email.recipients;
  subject.innerHTML = email.subject;
  timestamp.innerHTML = email.timestamp;
  body.innerHTML = email.body;

  answer.className = "btn btn-outline-primary";

  if (mailbox != "sent") {
    answer.style.display = "block";
    answer.onclick = () => {
      compose_email(true);
      answerEmail(email);
    };
  } else {
    answer.style.display = "none";
  }

  if (pushState) {
    history.pushState({ view: 'read', email: email, mailbox: mailbox }, '', `#read-${email.id}`);
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
