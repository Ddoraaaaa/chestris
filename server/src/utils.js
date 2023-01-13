export function makeId(length) {
   var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   var result = "";
   var charactersLength = 26 + 26 + 10;
   for ( let i = 0; i < length; i++ ) {
      result += characters[Math.floor(Math.random() * charactersLength)];
   }
   return result;
}
