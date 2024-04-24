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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

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
      load_mailbox('sent')
    })
    .catch((error) => {
      console.log("Error:", error);
    });
  })  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mailbox requested by the user.   
  // When the inbox, sent, or archive button is clicked...
  document.querySelectorAll('.mail-box').forEach(function(button) {
    button.onclick = function() {
      // https://cs50.harvard.edu/web/2020/notes/5/#arrow-functions - this keyword
      // console.log("This value:", this.innerHTML);
      mailbox = (this.innerHTML).toLowerCase();
      console.log("Mailbox:", mailbox)

      // When a mailbox is visited, the application should first query the API for the latest emails in that mailbox.  
      // Send a GET request to /emails/<mailbox> to request the emails for a particular mailbox.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
          // Print emails
          console.log(emails);
      
          // ... do something else with emails ...
          // Each email is rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
          const emails_view_div = document.querySelector('#emails-view');
          const table = document.createElement('table'); 
          emails_view_div.append(table);
          // https://stackoverflow.com/questions/64873647/dom-error-while-using-classlist-add-method
          table.classList.add("table");
          table.classList.add("table-bordered");          
          table.classList.add("table-hover");
          const table_head = document.createElement('thead');  
          table.append(table_head);        
          const table_head_row = document.createElement('tr');
          table_head.append(table_head_row);
          const th_1 = document.createElement('th');
          const th_2 = document.createElement('th');
          const th_3 = document.createElement('th');
          th_1.innerHTML = "From";
          th_2.innerHTML = "Subject";
          th_3.innerHTML = "Timestamp";
          table_head_row.append(th_1,th_2,th_3);
          // table_head_row.append(th_2);
          // table_head_row.append(th_3);
          const table_body = document.createElement('tbody');


          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
          for (const email of emails) {
            console.log("Email:", email);            
            
            const table_row = document.createElement('tr');
            const table_data_1 = document.createElement('td');
            const table_data_2 = document.createElement('td');
            const table_data_3 = document.createElement('td');
            table_data_1.innerHTML = `${email.sender}`;
            table_data_2.innerHTML = `${email.subject}`;
            table_data_3.innerHTML = `${email.timestamp}`;
            
            table.append(table_body);
            table_body.append(table_row);
            table_row.append(table_data_1);
            table_row.append(table_data_2);
            table_row.append(table_data_3);

            // !!!!!! NOT TESTED YET !!!!!!
            // If the email is unread, it should appear with a white background. 
            if (email.read === False) {
              this.table_row.classList.add("table-light");
            } else {
              // If the email has been read, it should appear with a gray background.
              this.table_row.classList.add("table-secondary");
            }
          }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
    }
  })
}