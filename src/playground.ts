
export async function playground() {

}


function proc(arr : number[], targetSum : number){
    // Returns two el from arr that together make target sum
    // const array = [3, 5, -4, 8, 11, 1, -1, 6];
    // const targetSum = 10;
    var delta;
    var nums = {};
    for(const el of arr){
        delta = targetSum - el;
        if(delta in nums)
            return [el, delta];
        else
            nums[el] = true;
    }
    return [];
}