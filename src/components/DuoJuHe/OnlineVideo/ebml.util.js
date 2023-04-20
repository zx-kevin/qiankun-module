import * as common from './EBML.js'

/**
 * @param {Blob} file - File or Blob object.
 * @param {function} callback - Callback function.
 * @example
 * getSeekableBlob(blob or file, callback);
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */
export function getSeekableBlob (inputBlob, callback) {
  const reader = new common.Reader()
  const decoder = new common.Decoder()
  const tool = common.tools

  const fileReader = new FileReader()
  fileReader.onload = function (e) {
    const ebmlElms = decoder.decode(this.result)
    ebmlElms.forEach(function (element) {
      reader.read(element)
    })
    reader.stop()
    const refinedMetadataBuf = tool.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues)
    const body = this.result.slice(reader.metadataSize)
    const newBlob = new Blob([refinedMetadataBuf, body], {
      type: 'video/webm',
    })

    callback(newBlob)
  }
  fileReader.readAsArrayBuffer(inputBlob)
}
