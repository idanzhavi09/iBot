const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

function saveTask(task , PHONE_NUMBER){
    const doc = new GoogleSpreadsheet(process.env.TASK_SPREADSHEET_KEY);
        await doc.useServiceAccountAuth({
            // env var values are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            client_email: process.env.client_email,
            private_key: process.env.private_key,
          });

          await doc.loadInfo(); // loads document properties and worksheets

          const sheet = doc.sheetsByIndex[0];
          const rows = await (await sheet).getRows()
          const addrow = await (await sheet).addRow({PHONE_NUMBER: PHONE_NUMBER , TASK: task})
}

function getTasks(PHONE_NUMBER) {
    const doc = new GoogleSpreadsheet(process.env.TASK_SPREADSHEET_KEY);
    await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email: process.env.client_email,
        private_key: process.env.private_key,
    });

      await doc.loadInfo(); // loads document properties and worksheets
      const sheet = doc.sheetsByIndex[0];
      let tasks = [];
      const rows = await (await sheet).getRows()
      for(let i = 0; i < rows.length ;i++){
          if(rows[i].PHONE_NUMBER == PHONE_NUMBER){
              tasks.push(rows[i].TASK)
          }
      }
      let tasksOutput = 'מטלות:';
      let index = 1;
      tasks.forEach(task => {
          tasksOutput += '\n' +'(' + index +')'  + task;
          index++;
      });

      return tasksOutput;
}

function delTask(PHONE_NUMBER , taskNum){
    const doc = new GoogleSpreadsheet(process.env.TASK_SPREADSHEET_KEY);
        await doc.useServiceAccountAuth({
            // env var values are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            client_email: process.env.client_email,
            private_key: process.env.private_key,
        });

          await doc.loadInfo(); // loads document properties and worksheets
          const sheet = doc.sheetsByIndex[0];
          const rows = await (await sheet).getRows()
          let userTasks = [];
          rows.forEach(task => {
              if(task.PHONE_NUMBER == PHONE_NUMBER){
                  userTasks.push(task);
              }
          });
          
          let task = userTasks[taskNum].TASK;
          let savePos = 0;
          let index = 0;
          rows.forEach(row => {
              if(row.TASK == task){
                  savePos = index;
              }
              index++;
          });
          await rows[savePos].delete();
}

module.exports = {
    saveTask,
    getTasks,
    delTask,
}