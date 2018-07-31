/**
 * Copyright (c) 2017-present, Wonday (@wonday.org)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "PdfManager.h"
#import "RCTPdfPageView.h"



#import <Foundation/Foundation.h>
#import <QuartzCore/QuartzCore.h>

#if __has_include(<React/RCTAssert.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
#import <React/UIView+React.h>
#import <React/RCTLog.h>
#else
#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "RCTLog.h"
#endif

#ifndef __OPTIMIZE__
// only output log when debug
#define DLog( s, ... ) NSLog( @"<%p %@:(%d)> %@", self, [[NSString stringWithUTF8String:__FILE__] lastPathComponent], __LINE__, [NSString stringWithFormat:(s), ##__VA_ARGS__] )
#else
#define DLog( s, ... )
#endif

// output log both debug and release
#define RLog( s, ... ) NSLog( @"<%p %@:(%d)> %@", self, [[NSString stringWithUTF8String:__FILE__] lastPathComponent], __LINE__, [NSString stringWithFormat:(s), ##__VA_ARGS__] )

@implementation RCTPdfPageView {

   
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        
        self.backgroundColor = UIColor.whiteColor;
        
    }
    
    return self;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps
{
    long int count = [changedProps count];
    for (int i = 0 ; i < count; i++) {
        
        if ([[changedProps objectAtIndex:i] isEqualToString:@"page"]) {
            [self setNeedsDisplay];
        }

    }
    
    [self setNeedsDisplay];
}


- (void)reactSetFrame:(CGRect)frame
{
    [super reactSetFrame:frame];
}

- (void)drawRect:(CGRect)rect
{
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    // PDF page drawing expects a Lower-Left coordinate system, so we flip the coordinate system before drawing.
    //CGContextScaleCTM(context, 1.0, -1.0);
    
    CGFloat dpi = 0.5;
    
    CGPDFDocumentRef pdfRef= [PdfManager getPdf:_fileNo];
    if (pdfRef!=NULL)
    {
        
        CGPDFPageRef pdfPage = CGPDFDocumentGetPage(pdfRef, _page);
        
        if (pdfPage != NULL) {
            
            CGRect pageRect = CGPDFPageGetBoxRect(pdfPage, kCGPDFMediaBox);
            
            CGSize new_size;
            new_size.height = pageRect.size.width * dpi;
            new_size.width = pageRect.size.height * dpi;
            
            UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:new_size];
            
            CGFloat scale_x = self.bounds.size.width / new_size.width;
            CGFloat scale_y = self.bounds.size.height / new_size.height;
            
            CGFloat scale = scale_x < scale_y ? scale_x : scale_y;
            
            CGRect pageBounds;
            pageBounds = CGRectMake((self.bounds.size.width - new_size.width * scale) / 2,
                                    (self.bounds.size.height - new_size.height * scale) / 2,
                                    new_size.width * scale,
                                    new_size.height * scale);
            
            UIImage *image = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull context) {
                [[UIColor whiteColor] set];
                [context fillRect:CGRectMake(0, 0, new_size.width, new_size.height)];
                CGContextTranslateCTM(context.CGContext, 0.0, new_size.height);
                CGContextScaleCTM(context.CGContext, dpi, dpi);
                CGContextRotateCTM(context.CGContext, -M_PI/2);
                CGContextDrawPDFPage(context.CGContext, pdfPage);
            }];
            

            
            // Fill the background with white.
            CGContextSetRGBFillColor(context, 1.0,1.0,1.0,1.0);
            CGContextFillRect(context, self.bounds);
            
            CGContextDrawImage(context, pageBounds, image.CGImage);
            RLog(@"drawpage %d", _page);
        }

    }
}

@end
