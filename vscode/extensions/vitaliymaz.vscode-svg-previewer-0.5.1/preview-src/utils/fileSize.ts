export function getByteCountByContent( s: string = '' ): number {
  let count = 0, stringLength = s.length, i;
  s = String( s || '' );
  for( i = 0 ; i < stringLength ; i++ )
  {
    const partCount = encodeURI( s[i] ).split('%').length;
    count += partCount === 1 ? 1:partCount-1;
  }
  return count;
}

export function humanFileSize(size: number = 0): string {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    const numberPart = +( size / Math.pow(1024, i) ).toFixed(2) * 1;
    const stringPart = ['B', 'kB', 'MB', 'GB', 'TB'][i];
    return `${numberPart} ${stringPart}`;
};