const buttons=[...document.querySelectorAll('[data-file]')];
async function showCode(button){
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const file=button.dataset.file;
  document.getElementById('code-status').textContent='Loading '+button.textContent+'…';
  try{
    const response=await fetch('source/'+file);if(!response.ok)throw Error('File unavailable');
    const code=await response.text();document.getElementById('code').textContent=code;
    document.getElementById('code-status').textContent=button.textContent+' · '+code.split('\n').length+' lines · '+(new Blob([code]).size/1024).toFixed(1)+' KB';
    const link=document.getElementById('download-file');link.href='source/'+file;link.download=file.replace(/\.txt$/,'');
  }catch{document.getElementById('code-status').textContent='Open the live code page, or download the ZIP and open its files in a text editor.';}
}
buttons.forEach(button=>button.addEventListener('click',()=>showCode(button)));showCode(buttons[0]);
