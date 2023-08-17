import { createStage, createSymbol, container, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { AABBBounds } from '@visactor/vutils';

// container.load(roughModule);

export const page = () => {
  console.time();
  const parser = new XMLParser({ ignoreAttributes: false });
  const isSvg = XMLValidator.validate(
    `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
    {
      allowBooleanAttributes: true
    }
  );
  console.log(isSvg);
  const result = parser.parse(
    `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  );
  console.timeEnd();
  console.log(result);
  const symbolList = [
    'circle',
    'cross',
    'diamond',
    'square',
    'arrow',
    'arrow2Left',
    'arrow2Right',
    'arrow2Up',
    'arrow2Down',
    'wedge',
    'thinTriangle',
    'triangle',
    'triangleUp',
    'triangleDown',
    'triangleRight',
    'triangleLeft',
    'stroke',
    'star',
    'wye',
    'rect',
    'lineH',
    'lineV',
    'close',
    'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5',
    `<svg t="1692006453056" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9835" width="200" height="200"><path d="M682.688 384h42.688v42.688h-42.688zM298.688 384h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9836"></path><path d="M341.312 384H384v42.688h-42.688zM426.688 384h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9837"></path><path d="M469.312 384H512v42.688h-42.688zM554.688 384h42.688v42.688h-42.688zM640 384h42.688v42.688H640zM768 426.688h42.688v42.688H768zM810.688 426.688h42.688v42.688h-42.688zM170.688 426.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9838"></path><path d="M213.312 426.688H256v42.688h-42.688z" fill="#FFFFFF" p-id="9839"></path><path d="M682.688 426.688h42.688v42.688h-42.688z" fill="#5D291A" p-id="9840"></path><path d="M682.688 469.312h42.688V512h-42.688z" fill="#5D291A" p-id="9841"></path><path d="M725.312 426.688H768v42.688h-42.688z" fill="#5D291A" p-id="9842"></path><path d="M725.312 469.312H768V512h-42.688zM682.688 512h42.688v42.688h-42.688zM768 469.312h42.688V512H768zM810.688 469.312h42.688V512h-42.688zM256 426.688h42.688v42.688H256zM298.688 426.688h42.688v42.688h-42.688zM384 426.688h42.688v42.688H384zM426.688 426.688h42.688v42.688h-42.688zM213.312 469.312H256V512h-42.688z" fill="#5D291A" p-id="9843"></path><path d="M298.688 469.312h42.688V512h-42.688zM384 469.312h42.688V512H384zM426.688 469.312h42.688V512h-42.688zM512 426.688h42.688v42.688H512z" fill="#5D291A" p-id="9844"></path><path d="M512 469.312h42.688V512H512zM298.688 512h42.688v42.688h-42.688zM384 512h42.688v42.688H384zM426.688 512h42.688v42.688h-42.688zM554.688 426.688h42.688v42.688h-42.688z" fill="#5D291A" p-id="9845"></path><path d="M597.312 426.688H640v42.688h-42.688z" fill="#5D291A" p-id="9846"></path><path d="M597.312 469.312H640V512h-42.688zM554.688 512h42.688v42.688h-42.688z" fill="#5D291A" p-id="9847"></path><path d="M597.312 512H640v42.688h-42.688zM640 512h42.688v42.688H640zM170.688 469.312h42.688V512h-42.688zM256 469.312h42.688V512H256zM341.312 512H384v42.688h-42.688zM469.312 512H512v42.688h-42.688zM512 512h42.688v42.688H512zM554.688 469.312h42.688V512h-42.688z" fill="#5D291A" p-id="9848"></path><path d="M682.688 597.312h42.688V640h-42.688z" fill="#FFFFFF" p-id="9849"></path><path d="M725.312 554.688H768v42.688h-42.688z" fill="#FFFFFF" p-id="9850"></path><path d="M725.312 597.312H768V640h-42.688zM682.688 640h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9851"></path><path d="M725.312 640H768v42.688h-42.688zM768 554.688h42.688v42.688H768z" fill="#FFFFFF" p-id="9852"></path><path d="M768 597.312h42.688V640H768zM768 640h42.688v42.688H768zM682.688 682.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9853"></path><path d="M725.312 682.688H768v42.688h-42.688zM768 682.688h42.688v42.688H768z" fill="#FFFFFF" p-id="9854"></path><path d="M682.688 725.312h42.688V768h-42.688z" fill="#FFFFFF" p-id="9855"></path><path d="M725.312 725.312H768V768h-42.688zM725.312 768H768v42.688h-42.688zM213.312 554.688H256v42.688h-42.688z" fill="#FFFFFF" p-id="9856"></path><path d="M213.312 597.312H256V640h-42.688zM298.688 597.312h42.688V640h-42.688zM426.688 597.312h42.688V640h-42.688zM512 597.312h42.688V640H512zM213.312 640H256v42.688h-42.688zM256 640h42.688v42.688H256zM298.688 640h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9857"></path><path d="M341.312 640H384v42.688h-42.688zM384 640h42.688v42.688H384zM426.688 640h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9858"></path><path d="M469.312 640H512v42.688h-42.688zM512 640h42.688v42.688H512zM597.312 597.312H640V640h-42.688zM554.688 640h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9859"></path><path d="M597.312 640H640v42.688h-42.688zM213.312 682.688H256v42.688h-42.688zM256 682.688h42.688v42.688H256zM298.688 682.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9860"></path><path d="M341.312 682.688H384v42.688h-42.688zM384 682.688h42.688v42.688H384zM426.688 682.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9861"></path><path d="M469.312 682.688H512v42.688h-42.688zM512 682.688h42.688v42.688H512zM554.688 682.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9862"></path><path d="M597.312 682.688H640v42.688h-42.688zM341.312 725.312H384V768h-42.688zM384 725.312h42.688V768H384zM426.688 725.312h42.688V768h-42.688z" fill="#FFFFFF" p-id="9863"></path><path d="M469.312 725.312H512V768h-42.688zM384 768h42.688v42.688H384zM426.688 768h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9864"></path><path d="M469.312 768H512v42.688h-42.688zM512 725.312h42.688V768H512zM512 768h42.688v42.688H512zM554.688 725.312h42.688V768h-42.688zM426.688 810.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9865"></path><path d="M469.312 810.688H512v42.688h-42.688zM256 768h42.688v42.688H256zM298.688 768h42.688v42.688h-42.688zM298.688 810.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9866"></path><path d="M341.312 810.688H384v42.688h-42.688zM597.312 768H640v42.688h-42.688zM554.688 810.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9867"></path><path d="M597.312 810.688H640v42.688h-42.688zM341.312 853.312H384V896h-42.688zM384 853.312h42.688V896H384zM512 853.312h42.688V896H512z" fill="#FFFFFF" p-id="9868"></path><path d="M554.688 853.312h42.688V896h-42.688z" fill="#FFFFFF" p-id="9869"></path><path d="M597.312 853.312H640V896h-42.688zM682.688 810.688h42.688v42.688h-42.688zM512 810.688h42.688v42.688H512zM554.688 768h42.688v42.688h-42.688zM597.312 725.312H640V768h-42.688zM682.688 768h42.688v42.688h-42.688zM426.688 853.312h42.688V896h-42.688z" fill="#FFFFFF" p-id="9870"></path><path d="M469.312 853.312H512V896h-42.688zM640 597.312h42.688V640H640zM640 640h42.688v42.688H640zM640 682.688h42.688v42.688H640z" fill="#FFFFFF" p-id="9871"></path><path d="M640 725.312h42.688V768H640zM640 768h42.688v42.688H640zM640 810.688h42.688v42.688H640z" fill="#FFFFFF" p-id="9872"></path><path d="M640 853.312h42.688V896H640zM256 554.688h42.688v42.688H256z" fill="#FFFFFF" p-id="9873"></path><path d="M256 597.312h42.688V640H256zM341.312 597.312H384V640h-42.688zM384 597.312h42.688V640H384zM469.312 597.312H512V640h-42.688zM554.688 597.312h42.688V640h-42.688zM256 725.312h42.688V768H256zM298.688 725.312h42.688V768h-42.688zM341.312 768H384v42.688h-42.688zM384 810.688h42.688v42.688H384z" fill="#FFFFFF" p-id="9874"></path><path d="M768 810.688h42.688v42.688H768zM810.688 810.688h42.688v42.688h-42.688zM170.688 810.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9875"></path><path d="M213.312 810.688H256v42.688h-42.688zM85.312 853.312H128V896h-42.688zM128 853.312h42.688V896H128z" fill="#FFFFFF" p-id="9876"></path><path d="M170.688 853.312h42.688V896h-42.688z" fill="#FFFFFF" p-id="9877"></path><path d="M213.312 853.312H256V896h-42.688zM256 853.312h42.688V896H256zM85.312 896H128v42.688h-42.688zM128 896h42.688v42.688H128zM170.688 896h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9878"></path><path d="M213.312 896H256v42.688h-42.688zM256 896h42.688v42.688H256zM298.688 896h42.688v42.688h-42.688zM256 938.688h42.688v42.688H256zM298.688 938.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9879"></path><path d="M341.312 938.688H384v42.688h-42.688zM384 938.688h42.688v42.688H384zM426.688 938.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9880"></path><path d="M469.312 938.688H512v42.688h-42.688zM512 938.688h42.688v42.688H512zM554.688 938.688h42.688v42.688h-42.688z" fill="#FFFFFF" p-id="9881"></path><path d="M597.312 938.688H640v42.688h-42.688zM682.688 896h42.688v42.688h-42.688zM682.688 938.688h42.688v42.688h-42.688zM725.312 853.312H768V896h-42.688z" fill="#FFFFFF" p-id="9882"></path><path d="M725.312 896H768v42.688h-42.688zM725.312 938.688H768v42.688h-42.688zM768 896h42.688v42.688H768zM810.688 896h42.688v42.688h-42.688zM853.312 853.312H896V896h-42.688zM896 853.312h42.688V896H896zM938.688 853.312h42.688V896h-42.688z" fill="#FFFFFF" p-id="9883"></path><path d="M853.312 896H896v42.688h-42.688zM896 896h42.688v42.688H896zM42.688 853.312h42.688V896H42.688zM768 853.312h42.688V896H768zM810.688 853.312h42.688V896h-42.688zM640 938.688h42.688v42.688H640zM128 810.688h42.688v42.688H128z" fill="#FFFFFF" p-id="9884"></path><path d="M725.312 384H768v42.688h-42.688zM725.312 512H768v42.688h-42.688zM768 384h42.688v42.688H768zM768 512h42.688v42.688H768zM682.688 554.688h42.688v42.688h-42.688zM768 725.312h42.688V768H768zM768 768h42.688v42.688H768zM810.688 384h42.688v42.688h-42.688zM810.688 512h42.688v42.688h-42.688zM810.688 554.688h42.688v42.688h-42.688z" p-id="9885"></path><path d="M810.688 597.312h42.688V640h-42.688zM810.688 640h42.688v42.688h-42.688zM810.688 682.688h42.688v42.688h-42.688zM810.688 768h42.688v42.688h-42.688zM853.312 426.688H896v42.688h-42.688z" p-id="9886"></path><path d="M853.312 469.312H896V512h-42.688zM896 512h42.688v42.688H896zM938.688 512h42.688v42.688h-42.688zM938.688 640h42.688v42.688h-42.688zM896 682.688h42.688v42.688H896zM853.312 725.312H896V768h-42.688zM170.688 384h42.688v42.688h-42.688z" p-id="9887"></path><path d="M213.312 384H256v42.688h-42.688zM256 384h42.688v42.688H256zM128 426.688h42.688v42.688H128zM213.312 512H256v42.688h-42.688zM298.688 554.688h42.688v42.688h-42.688zM384 554.688h42.688v42.688H384zM426.688 554.688h42.688v42.688h-42.688zM512 554.688h42.688v42.688H512zM170.112 639.424h42.688v42.688h-42.688zM597.312 554.688H640v42.688h-42.688zM170.112 682.112h42.688v42.688h-42.688zM128 768h42.688v42.688H128zM42.688 810.688h42.688v42.688H42.688zM213.312 768H256v42.688h-42.688zM256 810.688h42.688v42.688H256zM298.688 853.312h42.688V896h-42.688zM42.688 896h42.688v42.688H42.688zM341.312 896H384v42.688h-42.688zM384 896h42.688v42.688H384zM426.688 896h42.688v42.688h-42.688z" p-id="9888"></path><path d="M469.312 896H512v42.688h-42.688zM85.312 938.688H128v42.688h-42.688zM128 938.688h42.688v42.688H128zM170.688 938.688h42.688v42.688h-42.688z" p-id="9889"></path><path d="M213.312 938.688H256v42.688h-42.688zM512 896h42.688v42.688H512zM554.688 896h42.688v42.688h-42.688z" p-id="9890"></path><path d="M597.312 896H640v42.688h-42.688zM682.688 853.312h42.688V896h-42.688zM896 810.688h42.688v42.688H896zM938.688 810.688h42.688v42.688h-42.688zM768 938.688h42.688v42.688H768zM810.688 938.688h42.688v42.688h-42.688z" p-id="9891"></path><path d="M853.312 938.688H896v42.688h-42.688zM896 938.688h42.688v42.688H896zM938.688 896h42.688v42.688h-42.688zM725.312 810.688H768v42.688h-42.688zM853.312 810.688H896v42.688h-42.688zM298.688 341.312h42.688V384h-42.688z" p-id="9892"></path><path d="M341.312 341.312H384V384h-42.688zM426.688 341.312h42.688V384h-42.688z" p-id="9893"></path><path d="M469.312 341.312H512V384h-42.688zM554.688 341.312h42.688V384h-42.688zM640 341.312h42.688V384H640zM640 554.688h42.688v42.688H640zM682.688 341.312h42.688V384h-42.688zM981.312 554.688H1024v42.688h-42.688z" p-id="9894"></path><path d="M981.312 597.312H1024V640h-42.688zM0 853.312h42.688V896H0zM0 896h42.688v42.688H0zM256 981.312h42.688V1024H256zM298.688 981.312h42.688V1024h-42.688z" p-id="9895"></path><path d="M341.312 981.312H384V1024h-42.688zM384 981.312h42.688V1024H384zM426.688 981.312h42.688V1024h-42.688z" p-id="9896"></path><path d="M469.312 981.312H512V1024h-42.688zM512 981.312h42.688V1024H512zM554.688 981.312h42.688V1024h-42.688z" p-id="9897"></path><path d="M597.312 981.312H640V1024h-42.688zM640 896h42.688v42.688H640zM640 981.312h42.688V1024H640zM682.688 981.312h42.688V1024h-42.688z" p-id="9898"></path><path d="M725.312 981.312H768V1024h-42.688zM981.312 853.312H1024V896h-42.688zM981.312 896H1024v42.688h-42.688zM128 469.312h42.688V512H128z" p-id="9899"></path><path d="M298.688 170.688h42.688v42.688h-42.688zM426.688 170.688h42.688v42.688h-42.688z" fill="#D1B477" p-id="9900"></path><path d="M298.688 213.312h42.688V256h-42.688zM469.312 213.312H512V256h-42.688zM341.312 256H384v42.688h-42.688zM469.312 256H512v42.688h-42.688zM384 298.688h42.688v42.688H384zM512 298.688h42.688v42.688H512zM554.688 170.688h42.688v42.688h-42.688z" fill="#D1B477" p-id="9901"></path><path d="M554.688 213.312h42.688V256h-42.688zM597.312 256H640v42.688h-42.688zM469.312 42.688H512v42.688h-42.688zM341.312 85.312H384V128h-42.688z" fill="#D1B477" p-id="9902"></path><path d="M469.312 85.312H512V128h-42.688zM384 384h42.688v42.688H384zM341.312 426.688H384v42.688h-42.688zM469.312 426.688H512v42.688h-42.688zM512 384h42.688v42.688H512zM597.312 384H640v42.688h-42.688zM341.312 128H384v42.688h-42.688zM426.688 128h42.688v42.688h-42.688zM384 341.312h42.688V384H384zM512 0h42.688v42.688H512zM512 341.312h42.688V384H512zM597.312 128H640v42.688h-42.688zM597.312 341.312H640V384h-42.688zM640 298.688h42.688v42.688H640zM640 426.688h42.688v42.688H640z" fill="#D1B477" p-id="9903"></path><path d="M640 469.312h42.688V512H640zM341.312 469.312H384V512h-42.688zM469.312 469.312H512V512h-42.688z" fill="#D1B477" p-id="9904"></path><path d="M170.688 512h42.688v42.688h-42.688zM256 512h42.688v42.688H256zM170.688 554.688h42.688v42.688h-42.688zM341.312 554.688H384v42.688h-42.688zM469.312 554.688H512v42.688h-42.688z" p-id="9905"></path><path d="M170.688 597.312h42.688V640h-42.688zM554.688 554.688h42.688v42.688h-42.688zM212.8 724.8h42.688v42.688h-42.688zM170.688 768h42.688v42.688h-42.688zM85.312 810.688H128v42.688h-42.688z" p-id="9906"></path></svg>`
  ];
  const graphics: IGraphic[] = [];

  symbolList.forEach((st, i) => {
    const symbol = createSymbol({
      symbolType: st,
      x: ((i * 100) % 500) + 100,
      y: (Math.floor((i * 100) / 500) + 1) * 100,
      stroke: 'black',
      lineWidth: 3,
      lineCap: 'round',
      size: 60
      // background:
      //   '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
      // texture: 'diamond',
      // texturePadding: 0,
      // textureSize: 3,
      // textureColor: 'red'
    });
    symbol.addEventListener('mouseenter', () => {
      symbol.setAttribute('fill', 'blue');
    });
    // symbol.setMode('3d');
    graphics.push(symbol);
  });

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  // stage.set3dOptions({
  //   enable: true,
  //   alpha: 0.3
  // });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  const c = stage.toCanvas(false, new AABBBounds().set(100, 100, 300, 360));
  // document.body.appendChild(c);
};
