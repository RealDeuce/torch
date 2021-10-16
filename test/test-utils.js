let waitUntil = function (predicate, name = "", interval = 10, timeout = 1000 ) {
    let sleep = ms => new Promise(r => setTimeout(r, ms));
    let waitFor = async function waitFor(f){
        let endTime = Date.now() + timeout;
        let result = predicate();
        let optname = ` ${name} `;
        while (!result) {
            if (timeout >= 0 && Date.now() > endTime) {
                console.log(`waitUntil${optname}timed out after ${timeout} ms`);
                return false;
            }
            await sleep(interval);
            result = predicate();
        }
        return result;
    };
    return waitFor(predicate);
}

export { waitUntil };