import romaji_fsm from './romaji_fsm.json';
import eaten2regexp from './eaten2regex.json';


type RomajiFSM = {
    [index:string]: RomajiFSM | string;
}

function feed(node: RomajiFSM, s: string): RomajiFSM | null {
    if (node.hasOwnProperty(s)) {
        return null;
    } else {
        return node[s] as RomajiFSM;
    }
}

function is_end(node: RomajiFSM) {
    return node.hasOwnProperty('');
}

function roma2kana(s: string) {
    const ss = s.replace('nn', 'n\'');
    let node = romaji_fsm;
    let res = '';
    let eaten = '';
    for (let i = 0; i < ss.length; ++i) {
        const c = ss.charAt(i);
        const cur = feed(node, c);
        if (cur === null) {
            if (is_end(node)) {
                res
            } else {

            }
        } else if (typeof node !== 'string') {
            node
        }
    }
}