
#ifndef MXNET_OPERATOR_NEW_FORWARD_CUH_
#define MXNET_OPERATOR_NEW_FORWARD_CUH_

#include <mxnet/base.h>


#define BLOCK 1024
#define TILE_W 32



namespace mxnet
{
namespace op
{



__global__ void sharedMatMul(const float *x, float *y, const float *k, const int M, const int C, const int H, const int W, const int K)
{

    /*
    Modify this function to implement the forward pass described in Chapter 16.
    We have added an additional dimension to the tensors to support an entire mini-batch
    The goal here is to be correct AND fast.
    We have some nice #defs for you below to simplify indexing. Feel free to use them, or create your own.
    */


    int W_out = W-K+1;
    int H_out = H-K+1;
    int numInput1Cols = K*K*C;
    int numOutRows = M;
    int numOutCols = W_out*H_out;

    __shared__ float tile1[TILE_W][TILE_W];
    __shared__ float tile2[TILE_W][TILE_W];
    
    int xidx = threadIdx.x;
    int yidx = threadIdx.y;
    int colIdx = blockIdx.x*blockDim.x+xidx;
    int rowIdx = blockIdx.y*blockDim.y+yidx;
    

    float res = 0;
    int col, idx, row, c, w, h, p, q;



    for(int tIdx = 0; tIdx < ceil((float)numInput1Cols/(float)TILE_W); tIdx++){
        int matCol = tIdx*TILE_W+xidx;
        if(matCol < numInput1Cols){
            tile1[yidx][xidx] = k[rowIdx*numInput1Cols+matCol];
        }
        else{
            tile1[yidx][xidx] = 0;
        }

        int matRow = tIdx*TILE_W+yidx;
        if(matRow < numInput1Cols){
            
            idx = matRow*numOutCols+colIdx;
            col = idx%(W_out*H_out);
            row = idx/(W_out*H_out);
            q = row%K;
            row = row/K;
            p = row%K;
            c = row/K;
            w = col%W_out;
            h = col/W_out;

            tile2[yidx][xidx] = x[c*H*W + W*(p+h) + q+w];
        }
        else{
            tile2[yidx][xidx] = 0;
        }


        __syncthreads();
        for(int i = 0; i < TILE_W; i++){
            res += tile1[yidx][i]*tile2[i][xidx];
        }
        __syncthreads();
    }

    if((colIdx < numOutCols) && (rowIdx < numOutRows)){
        y[rowIdx*numOutCols+colIdx] = res;
    }










/*

// An example use of these macros:
// float a = y4d(0,0,0,0)
// y4d(0,0,0,0) = a
#define y4d(i3, i2, i1, i0) y[(i3) * (M * H_out * W_out) + (i2) * (H_out * W_out) + (i1) * (W_out) + i0]
#define x4d(i3, i2, i1, i0) x[(i3) * (C * H * W) + (i2) * (H * W) + (i1) * (W) + i0]
#define k4d(i3, i2, i1, i0) k[(i3) * (C * K * K) + (i2) * (K * K) + (i1) * (K) + i0]


 *y = output maps
 *x = input maps
 *k = filter bank (mask)
 B = mini-batch
 M = number of output maps
 C = number of input maps
 H = height of input maps
 W = width of input maps
 K = height and width of filter bank (mask)


    int H_out = H-K+1;
    int W_out = W-K+1;
    int W_grid = W_out / K;
    int n = blockIdx.x;
    int m = blockIdx.y;
    int h = blockIdx.z/W_grid + threadIdx.y;
    int w = blockIdx.z % W_grid + threadIdx.x;

    if(h >= H_out || w >= W_out)
        return;

    float acc = 0;
    for(int c=0; c<C; c++){
        for(int p=0; p<K; p++){
            for(int q=0; q<K; q++){
                acc += k4d(m, c, h+p, w+q)*x4d(n, c, h+p, w+q);
            }
        }
    }
    y4d(n, m, h, w) = acc;



#undef y4d
#undef x4d
#undef k4d


*/

}







void genMatMul(float *X, float *Y, float *K, int M, int C, int H, int W, int K_len){

    int numBlocksX = ceil((float)H*W/(float)TILE_W);
    int numBlocksY = ceil((float)M/(float)TILE_W);
    dim3 numBlocks(numBlocksX, numBlocksY);
    dim3 blockDim(TILE_W,TILE_W);
    sharedMatMul<<<numBlocks, blockDim>>>(X, Y, K, M, C, H, W, K_len);

}











/* 
   This function is called by new-inl.h
   Any code you write should be executed by this function.
   For ECE408, we only expect the float version of the operator to be called, so here we specialize with only floats.
*/
template <>
void forward<gpu, float>(mshadow::Tensor<gpu, 4, float> &y, const mshadow::Tensor<gpu, 4, float> &x, const mshadow::Tensor<gpu, 4, float> &w)
{




// Use mxnet's CHECK_EQ to do assertions.
    // Remove this assertion when you do your implementation!

    // Extract the tensor dimensions into B,M,C,H,W,K
    // ...

    const int B = x.shape_[0];
    const int M = y.shape_[1];
    const int C = x.shape_[1];
    const int H = x.shape_[2];
    const int W = x.shape_[3];
    const int K = w.shape_[3];
    const int H_out = H-K+1;
    const int W_out = W-K+1;

    float *Yptr = y.dptr_;
    float *Xptr = x.dptr_;
    float *krnl = w.dptr_;  


    // run gemm
    for(int b = B-1; b >= 0; b--){
        genMatMul(Xptr+b*W*H*C, Yptr+b*W_out*H_out*M, krnl, M, C, H, W, K);
    }

    


/*

    // Set the kernel dimensions
    // dim3 gridDim(0);
    // dim3 blockDim(0);
    const int TILE_WIDTH = 16;
    const int W_grid = ceil((float)W_out/(float)TILE_WIDTH);
    const int H_grid = ceil((float)H_out/(float)TILE_WIDTH);
    int Z = H_grid * W_grid;
    dim3 gridDim(B,M,Z);
    dim3 blockDim(TILE_WIDTH,TILE_WIDTH,1);



    // Call the kernel
    // forward_kernel<<<gridDim, blockDim, 0, s>>>(y.dptr_,x.dptr_,w.dptr_, B,M,C,H,W,K);
  forward_kernel<<<gridDim, blockDim>>>(y.dptr_, x.dptr_, w.dptr_, B,M,C,H,W,K);
  cudaDeviceSynchronize();

*/



    // Use MSHADOW_CUDA_CALL to check for CUDA runtime errors.
    MSHADOW_CUDA_CALL(cudaDeviceSynchronize());

}

/* 
    This tells mxnet how to do an op when it's not a float.
    This is not used in the ECE408 project
*/

template <typename gpu, typename DType>
void forward(mshadow::Tensor<gpu, 4, DType> &y, const mshadow::Tensor<gpu, 4, DType> &x, const mshadow::Tensor<gpu, 4, DType> &w)
{
    CHECK_EQ(0,1) << "Remove this line and replace it with your implementation.";
}
}
}


#endif