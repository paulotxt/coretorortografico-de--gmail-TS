import { correctEmail } from "./emailCorrector";


const emails = `
aline@gmaol.com
tiago@outllok.com
isabela@outloock.com
patricia@gmaul.com
felipe@hotmai.com
roberto@yahoo.con
julia@yahoo.coom
henrique@gmil.com
isabela@gmil.com
sofia@gmil.com
andre@yaaho.con
leticia@yaho.com
roberto@outloook.com
henrique@gmaul.com
sofia@yahoo.coom
vinicius@gmailll.com
gustavo@gmaii.com
amanda@yaaho.com
eduardo@outllok.com
thiago@outloock.com
amanda@outluk.com
henrique@hotmai.com
caio@hotmaill.com
victor@gmaol.com
victor@hotmaill.com
monica@yahho.com
beatriz@outloock.com
victor@gmai;.com
renata@otulook.com
maria@outloock.com
victor@yaho.com
eduardo@outloook.com
alexandre@yahoo.con
carolina@outloock.com
camila@outloook.com
andrea@gmil.com
claudia@outloock.com
thiago@gmaill.com
priscila@yaaho.con
patricia@hotmial.com
leticia@hotmaii.com
patricia@yahoo.comm
lucas@gmail.com
sofia@yaho.com
marina@yahho.com
claudia@htomail.com
fernanda@otulook.com
sofia@hotmaii.com
paulo@hotmai;.com
luana@outllok.com

`;


const emailList = emails.split(/\r?\n/).map(e => e.trim()).filter(Boolean);


for (const email of emailList) {
const r = correctEmail(email);
const line = `${email.padEnd(50)} → ${r.correctedEmail.padEnd(50)} | ${r.reason}`;
console.log(line);
}
