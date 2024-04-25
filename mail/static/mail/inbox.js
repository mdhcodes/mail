document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// Add/Pass argument to compose_email to determine if this is a new email or a reply. If it's a reply, certain information will be prefilled. 
function compose_email(reply, email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // If reply is true...
  if (reply && email) {
    // Pre-fill the composition form with the recipient field set to whoever sent the original email.
    document.querySelector('#compose-recipients').value = email.sender;
    
    // Pre-fill the subject line. If the original email had a subject line of foo, the new subject line should be Re: foo. (If the subject line already begins with Re: , no need to add it again.)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
    // console.log('Split \'\':', email.subject.split('')); // Returns [ "R", "e", ":", " ", "B", "o", "o", "k", " ", "I", … ]
    // console.log('Split \' \':', email.subject.split(' ')); // Returns ["Re:", "Book", "Info" ]
    if (email.subject.split(' ')[0] === 'Re:') {       
      // console.log('Contains Re:', email.subject.split(' ')[0] === 'Re:')
      document.querySelector('#compose-subject').value = email.subject;
    } else {      
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }

    // Pre-fill the body of the email with a line like "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  }  

  // Send email
  // When the 'SubmitQuery' Button is clicked...
  // const submit_btn = document.addEventListener('input', () => {}) // Did not test the 'input' event listener.
  // https://stackoverflow.com/questions/20840128/how-can-i-select-a-button-with-a-type-of-submit-using-javascript
  const submit_btn = document.querySelector('input[type="submit"]');

  // Getting the following error in Firefox: TypeError: NetworkError when attempting to fetch resource.
  // With Chrome, I received the above error but the data did post to the database.
  // To correct the error in Firefox and Chrome, I had to prevent the default form submission.
  // https://stackoverflow.com/questions/59176488/networkerror-when-attempting-to-fetch-resource-only-on-firefox
  // https://stackoverflow.com/questions/30473581/when-to-use-preventdefault-vs-return-false 
  submit_btn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent form submission

    // Store new email field values in the following variables.
    email_recipients = document.querySelector('#compose-recipients').value;
    email_subject = document.querySelector('#compose-subject').value;
    email_body = document.querySelector('#compose-body').value;

    // Send a POST request to the /emails route with the values captured above. 
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: email_recipients,
        subject: email_subject,
        body: email_body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('Result:', result);
      // Once the email has been sent, load the user’s sent mailbox.
      load_mailbox('sent');
    })
    .catch((error) => {
      console.log('Error:', error);
    });
  })  
}

function view_email(email) {
  // Make a GET request to /emails/<email_id> to request the email.
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      // Get the div to display an email.
      const email_view_div = document.querySelector('#email-view');
      // Hide the emails-view and compose-view divs.
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      email_view_div.style.display = 'block';
      // Display the email’s sender, recipients, subject, timestamp, and body.                  
      const h2 = document.createElement('h2');
      h2.innerHTML = `${email.subject}`;
      const p1 = document.createElement('p');
      p1.innerHTML = `From: ${email.sender}`;           
      const p2 = document.createElement('p');
      p2.innerHTML = `To: ${email.recipients}`;  
      const p3 = document.createElement('p');
      p3.innerHTML = `Subject: ${email.subject}`;                       
      const p4 = document.createElement('p');
      p4.innerHTML = `Date: ${email.timestamp}`;
      const hr = document.createElement('hr');                      
      const p5 = document.createElement('p');
      p5.innerHTML = `${email.body}`;             

      email_view_div.append(h2);
      email_view_div.append(p1);
      email_view_div.append(p2);
      email_view_div.append(p3);
      email_view_div.append(p4);
      email_view_div.append(hr);
      email_view_div.append(p5);

      // Allow users to reply to an email. 
      // Add 'Reply' button.
      const reply = document.createElement('button');
      reply.innerHTML = 'Reply';
      email_view_div.append(reply);

      // When the user clicks the “Reply” button, they should be taken to the email composition form.
      reply.addEventListener('click', function() {
        // Pre-fill the composition form with the recipient field set to whoever sent the original email.
        // Pre-fill the subject line. If the original email had a subject line of foo, the new subject line should be Re: foo. (If the subject line already begins with Re: , no need to add it again.)
        // Pre-fill the body of the email with a line like "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.

        // Add/Pass argument to compose_email to determine if this is a new email or a reply. If it's a reply, certain information will be prefilled.
        let reply = true;
        compose_email(reply, email);
      });
  }); 
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mailbox requested by the user.   
  // When the inbox, sent, or archive button is clicked...
  document.querySelectorAll('.mail-box').forEach(function(button) {
    button.onclick = function() {
      // https://cs50.harvard.edu/web/2020/notes/5/#arrow-functions - this keyword
      // console.log('This value:', this.innerHTML);
      mailbox = (this.innerHTML).toLowerCase();
      // console.log('Mailbox:', mailbox)

      // Match string in mailbox() function in views.py.
      if (mailbox === 'archived') {
        mailbox = 'archive';
      } 

      // When a mailbox is visited, the application should first query the API for the latest emails in that mailbox.  
      // Send a GET request to /emails/<mailbox> to request the emails for a particular mailbox.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
          // Print emails
          // console.log(emails);
      
          // ... do something else with emails ...
          // Each email is rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
          const emails_view_div = document.querySelector('#emails-view');
          const table = document.createElement('table'); 
          emails_view_div.append(table);
          // https://stackoverflow.com/questions/64873647/dom-error-while-using-classlist-add-method
          table.classList.add('table');
          table.classList.add('table-bordered');          
          table.classList.add('table-hover');
          const table_head = document.createElement('thead');  
          table.append(table_head);        
          const table_head_row = document.createElement('tr');
          table_head.append(table_head_row);
          const th_1 = document.createElement('th');
          const th_2 = document.createElement('th');
          const th_3 = document.createElement('th');
          const th_4 = document.createElement('th');
          th_1.innerHTML = 'From';
          th_2.innerHTML = 'To';
          th_3.innerHTML = 'Subject';
          th_4.innerHTML = 'Date';
          table_head_row.append(th_1,th_2,th_3,th_4);
          // table_head_row.append(th_2);
          // table_head_row.append(th_3);
          const table_body = document.createElement('tbody');

          // Loop over each email and display it on the page (inbox.html).
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
          for (const email of emails) {
            // console.log('Email:', email);            
            
            const table_row = document.createElement('tr'); // Don't need to add a link since the click on the row triggers the event.
            // When a user clicks on an email, the user is taken to a view where they see the content of that email. Add links to each email.
            // const email_link = document.createElement('a');

            // email link needs a url (email) and an argument (id) - https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
            // email_link.setAttribute('href', 'email' + email.id);
            // BOTH email_link.setAttribute() AND email_link.href WORK.
            // https://stackoverflow.com/questions/4689344/how-can-i-add-href-attribute-to-a-link-dynamically-using-javascript
            // email_link.href = 'email' + email.id;
            // Add event listener (click) to the table row - CONFLICTS WITH ARCHIVE BUTTON.
            
            table_row.addEventListener('click', function(event) {

              // https://stackoverflow.com/questions/43946330/overlapped-elements-with-onclick-event
              // https://www.w3schools.com/jsref/event_stoppropagation.asp
              // Removes the conflict and stops the table_row event from being triggered.
              event.stopPropagation();            

              // Clear contents of the email-view div. 
              document.querySelector('#email-view').innerHTML = '';

              view_email(email);
            });

            // Once an email has been clicked on, it is marked as read. 
            // Send a PUT request to /emails/<email_id> to update whether an email is read or not.
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })   
            
            // If the email is unread, it should appear with a white background. 
            // https://stackoverflow.com/questions/20664000/uncaught-reference-errorfalse-is-not-defined - false must be lowercase
            if (email.read === false) {
              table_row.classList.add('table-light');
            } else {
              // If the email has been read, it should appear with a gray background.
              table_row.classList.add('table-secondary');
            }                

            const table_data_1 = document.createElement('td');
            const table_data_2 = document.createElement('td');
            const table_data_3 = document.createElement('td');
            const table_data_4 = document.createElement('td');

            table_data_1.innerHTML = `${email.sender}`;
            table_data_2.innerHTML = `${email.recipients}`;
            table_data_3.innerHTML = `${email.subject}`;
            table_data_4.innerHTML = `${email.timestamp}`;
            
            table.append(table_body);
            table_body.append(table_row);
            table_row.append(table_data_1);
            table_row.append(table_data_2);
            table_row.append(table_data_3);
            table_row.append(table_data_4);  
            
            // When viewing an Inbox email, the user should be presented with a button that lets them archive the email. 
            // When viewing an Archive email, the user should be presented with a button that lets them unarchive the email. 
            if (mailbox === 'inbox' || mailbox === 'archive') {  
              // Create a button to archive email(s)
              const archive_button = document.createElement('button');

              
              archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';
              // OR
              // if (email.archived === false) {
              //   archive_button.innerHTML = 'Archive';  
              // } else {
              //   archive_button.innerHTML = 'Unarchive';
              // }

              // Adding the button to the row causes the click event to trigger the email to display not the inbox.
              table_row.append(archive_button);
          
              archive_button.addEventListener('click', (event) => {
                
                // https://stackoverflow.com/questions/43946330/overlapped-elements-with-onclick-event
                // https://www.w3schools.com/jsref/event_stoppropagation.asp
                // Removes the conflict and stops the table_row event from being triggered.
                event.stopPropagation();              
                                
                if (email.archived === false) {
                  // Send a PUT request to /emails/<email_id> to mark an email as archived or unarchived.
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  }).then(
                    // Once an email has been archived, load the user’s inbox. 
                    // !!!!!! The inbox loads but no emails are populated. !!!!!!
                    () => {
                      load_mailbox('inbox');
                    }
                  )
                } else {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })
                  .then(
                    // Once an email has been unarchived, load the user’s inbox. 
                    // !!!!!! The inbox loads but no emails are populated. !!!!!!
                    () => {
                      load_mailbox('inbox');
                    }
                  )
                }                  
              });
            }
          }
      })
      .catch((error) => {
        console.log('Error:', error);
      });
    }
  })
}                            