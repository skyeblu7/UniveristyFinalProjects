
#ifndef MXNET_OPERATOR_NEW_FORWARD_CUH_
#define MXNET_OPERATOR_NEW_FORWARD_CUH_

#define BLOCK_SIZE 1024
#define TILE_WIDTH_12 16
#define TILE_WIDTH_24 24

#include <mxnet/base.h>

namespace mxnet 
{
  namespace op 
  {
    __global__ void forward_kernel12(float *K, float *X, float *Y, int M, int C, int H, int W, int K_width, int H_out, int W_out) 
    {

      __shared__ float tileA[TILE_WIDTH_12][TILE_WIDTH_12];
      __shared__ float tileB[TILE_WIDTH_12][TILE_WIDTH_12];

      int numCColumns = H_out * W_out;
      int numAColumns = C * K_width * K_width;
      Y += blockIdx.z * M * numCColumns;
      X += blockIdx.z * H * W * C;

      int tx = threadIdx.x;
      int ty = threadIdx.y;
      int row_x = blockIdx.y * blockDim.y + threadIdx.y;
      int col_x = blockIdx.x * blockDim.x + threadIdx.x;

      float res = 0;
      int w, h, p, q, c;

      for (int tile_x = 0; tile_x < ceil((float)numAColumns / TILE_WIDTH_12);
          tile_x++) {

        int matrix_col = tile_x * TILE_WIDTH_12 + tx;
        int matrix_row = tile_x * TILE_WIDTH_12 + ty;

        if ((matrix_col < numAColumns) && (row_x < M)) {
          tileA[ty][tx] = K[row_x * numAColumns + matrix_col];
        } else {
          tileA[ty][tx] = 0;
        }

        if ((matrix_row < numAColumns) && (col_x < numCColumns)) {

          q = matrix_row % K_width;
          matrix_row /= K_width;
          p = matrix_row % K_width;
          c = matrix_row / K_width;
          w = col_x % W_out;
          h = col_x / W_out;

          tileB[ty][tx] = X[c * H * W + (h + p) * W + (w + q)];
        } else {
          tileB[ty][tx] = 0;
        }

        __syncthreads();
        for (int k = 0; k < TILE_WIDTH_12; k++) {
          res += tileA[ty][k] * tileB[k][tx];
        }
        __syncthreads();
      }

      if ((row_x < M) && (col_x < numCColumns)) {
        Y[row_x * numCColumns + col_x] = res;
      }
    }

    __global__ void forward_kernel24(float *K, float *X, float *Y, int M, int C, int H, int W, int K_width, int H_out, int W_out) 
    {

      __shared__ float tileA[TILE_WIDTH_24][TILE_WIDTH_24];
      __shared__ float tileB[TILE_WIDTH_24][TILE_WIDTH_24];

      int numCColumns = H_out * W_out;
      int numAColumns = C * K_width * K_width;
      Y += blockIdx.z * M * numCColumns;
      X += blockIdx.z * H * W * C;

      int tx = threadIdx.x;
      int ty = threadIdx.y;
      int row_x = blockIdx.y * blockDim.y + threadIdx.y;
      int col_x = blockIdx.x * blockDim.x + threadIdx.x;

      float res = 0;
      int w, h, p, q, c;

      for (int tile_x = 0; tile_x < ceil((float)numAColumns / TILE_WIDTH_24);
          tile_x++) {

        int matrix_col = tile_x * TILE_WIDTH_24 + tx;
        int matrix_row = tile_x * TILE_WIDTH_24 + ty;

        if ((matrix_col < numAColumns) && (row_x < M)) {
          tileA[ty][tx] = K[row_x * numAColumns + matrix_col];
        } else {
          tileA[ty][tx] = 0;
        }

        if ((matrix_row < numAColumns) && (col_x < numCColumns)) {

          q = matrix_row % K_width;
          matrix_row /= K_width;
          p = matrix_row % K_width;
          c = matrix_row / K_width;
          w = col_x % W_out;
          h = col_x / W_out;

          tileB[ty][tx] = X[c * H * W + (h + p) * W + (w + q)];
        } else {
          tileB[ty][tx] = 0;
        }

        __syncthreads();
        for (int k = 0; k < TILE_WIDTH_24; k++) {
          res += tileA[ty][k] * tileB[k][tx];
        }
        __syncthreads();
      }

      if ((row_x < M) && (col_x < numCColumns)) {
        Y[row_x * numCColumns + col_x] = res;
      }
    }

    /*
    This function is called by new-inl.h
    Any code you write should be executed by this function.
    For ECE408, we only expect the float version of the operator to be called, so
    here we specialize with only floats.
    */
    template <>
    void forward<gpu, float>(mshadow::Tensor<gpu, 4, float> & y, const mshadow::Tensor<gpu, 4, float> &x, const mshadow::Tensor<gpu, 4, float> &k) 
    {

      // Use mxnet's CHECK_EQ to do assertions.
      // Remove this assertion when you do your implementation!
      // CHECK_EQ(0, 1) << "Remove this line and replace with your
      // implementation";

      // Extract the tensor dimensions into B,M,C,H,W,K
      // ...
      const int B = x.shape_[0];
      const int M = y.shape_[1];
      const int C = x.shape_[1];
      const int H = x.shape_[2];
      const int W = x.shape_[3];
      const int K = k.shape_[3];
      const int H_out = H - K + 1;
      const int W_out = W - K + 1;
      float *Y = y.dptr_;
      float *X = x.dptr_;
      float *Kernel = k.dptr_;

      if (M == 12) {
        int numBlocksX = ceil((float)H_out * W_out / TILE_WIDTH_12);
        int numBlocksY = ceil((float)M / TILE_WIDTH_12);
        dim3 gridDim(numBlocksX, numBlocksY, B);
        dim3 blockDim(TILE_WIDTH_12, TILE_WIDTH_12, 1);

        forward_kernel12<<<gridDim, blockDim>>>(Kernel, X, Y, M, C, H, W, K, H_out, W_out);
      } 
      else if (M == 24) {
        int numBlocksX = ceil((float)H_out * W_out / TILE_WIDTH_24);
        int numBlocksY = ceil((float)M / TILE_WIDTH_24);
        dim3 gridDim(numBlocksX, numBlocksY, B);
        dim3 blockDim(TILE_WIDTH_24, TILE_WIDTH_24, 1);

        forward_kernel24<<<gridDim, blockDim>>>(Kernel, X, Y, M, C, H, W, K, H_out, W_out);
      }

      // Use MSHADOW_CUDA_CALL to check for CUDA runtime errors.
      MSHADOW_CUDA_CALL(cudaDeviceSynchronize());
    }

  /*
  This tells mxnet how to do an op when it's not a float.
  This is not used in the ECE408 project
  */
    template <typename gpu, typename DType>
    void forward(mshadow::Tensor<gpu, 4, DType> & y, const mshadow::Tensor<gpu, 4, DType> &x, const mshadow::Tensor<gpu, 4, DType> &w) 
    {
      CHECK_EQ(0, 1)<< "Remove this line and replace it with your implementation.";
    }
  }
} // namespace op

#endif
