import type { IPoint } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { RICHTEXT_NUMBER_TYPE } from '../../../graphic/richtext';
import type { IRichText } from '../../../interface';
import type { IGraphicRender } from '../../../render';
import { RichTextRender } from '../../../render';
import type { IGraphicPicker, IPickParams } from '../../picker-service';

const _bounds = new AABBBounds();

@injectable()
export class DefaultCanvasRichTextPicker implements IGraphicPicker {
  type: string = 'richtext';
  numberType: number = RICHTEXT_NUMBER_TYPE;

  constructor(@inject(RichTextRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(richtext: IRichText, point: IPoint, params?: IPickParams): boolean {
    if (richtext.AABBBounds.containsPoint(point)) {
      return true;
    }
    return false;
  }
}
